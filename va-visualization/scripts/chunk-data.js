const fs = require('fs').promises;
const path = require('path');

const INPUT_FILE = path.join(__dirname, '..', 'public', 'data', 'merged_vad.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data', 'chunks');
const METADATA_FILE = path.join(__dirname, '..', 'public', 'data', 'metadata.json');
const CHUNK_SIZE = 4000; // 청크 크기를 4000개로 증가

async function chunkData() {
  try {
    console.log('Starting data chunking process...');

    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`Output directory created at: ${OUTPUT_DIR}`);

    // Read the source data
    console.log(`Reading source file: ${INPUT_FILE}`);
    const rawData = await fs.readFile(INPUT_FILE, 'utf8');
    const emotions = JSON.parse(rawData);
    const totalCount = emotions.length;
    console.log(`Successfully read and parsed ${totalCount} emotion entries.`);

    // Calculate number of chunks
    const totalChunks = Math.ceil(totalCount / CHUNK_SIZE);
    console.log(`Data will be split into ${totalChunks} chunks of size ${CHUNK_SIZE}.`);

    // Create and write chunks
    for (let i = 0; i < totalChunks; i++) {
      const chunkStart = i * CHUNK_SIZE;
      const chunkEnd = chunkStart + CHUNK_SIZE;
      const chunkData = emotions.slice(chunkStart, chunkEnd);
      const chunkFileName = `chunk_${i}.json`;
      const chunkFilePath = path.join(OUTPUT_DIR, chunkFileName);
      
      await fs.writeFile(chunkFilePath, JSON.stringify(chunkData, null, 2));
      console.log(`Successfully wrote ${chunkFileName}`);
    }

    // Create metadata file
    const metadata = {
      totalCount,
      chunkSize: CHUNK_SIZE,
      totalChunks,
      createdAt: new Date().toISOString(),
    };
    await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
    console.log(`Successfully wrote metadata file at: ${METADATA_FILE}`);

    console.log('Data chunking process completed successfully!');
  } catch (error) {
    console.error('An error occurred during the chunking process:', error);
    process.exit(1);
  }
}

chunkData();