// Simple test script for FlipAI RoomGPT endpoints
// Run with: node test-endpoints.js

const testEndpoints = async () => {
  const baseUrl = 'http://localhost:3000';

  console.log('🧪 Testing FlipAI RoomGPT Endpoints\n');

  // Test 1: Generate endpoint without report
  console.log('Test 1: POST /generate (without report)');
  try {
    const response = await fetch(`${baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: 'https://example.com/test-room.jpg',
        theme: 'Modern',
        room: 'Living Room',
        generateReport: false,
        includeCostEstimates: false,
      }),
    });

    console.log(`Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Generate endpoint works (legacy mode)');
      console.log('Response type:', typeof data);
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Generate endpoint with report
  console.log('Test 2: POST /generate (with report)');
  try {
    const response = await fetch(`${baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: 'https://example.com/test-room.jpg',
        theme: 'Modern',
        room: 'Living Room',
        generateReport: true,
        includeCostEstimates: true,
      }),
    });

    console.log(`Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Generate endpoint works with report generation');
      console.log('Has renovatedImage:', !!data.renovatedImage);
      console.log('Has renovationReport:', !!data.renovationReport);
      if (data.renovationReport) {
        console.log('Report summary:', data.renovationReport.summary?.substring(0, 50) + '...');
      }
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Report endpoint
  console.log('Test 3: POST /report (standalone)');
  try {
    const response = await fetch(`${baseUrl}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalImage: 'https://example.com/original.jpg',
        renovatedImage: 'https://example.com/renovated.jpg',
        theme: 'Modern',
        roomType: 'Living Room',
        includeCostEstimates: true,
      }),
    });

    console.log(`Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Report endpoint works');
      console.log('Has summary:', !!data.summary);
      console.log('Has keyChanges:', !!data.keyChanges);
      console.log('Has costEstimates:', !!data.costEstimates);
      console.log('Style score:', data.styleScore);
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Validation tests
  console.log('Test 4: Validation tests');

  // Test missing required fields
  try {
    const response = await fetch(`${baseUrl}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Missing required fields
        theme: 'Modern',
      }),
    });

    console.log(`Validation test status: ${response.status}`);
    if (response.status === 400) {
      console.log('✅ Validation works correctly');
    } else {
      console.log('❌ Validation not working as expected');
    }
  } catch (error) {
    console.log('❌ Validation test error:', error.message);
  }

  console.log('\n🏁 Testing complete!');
  console.log('\n📝 Notes:');
  console.log('- Make sure the development server is running (npm run dev)');
  console.log('- Ensure environment variables are set in .env.local');
  console.log('- Replicate API requires actual images for generation');
  console.log('- OpenAI API key is required for report generation');
};

// Run tests
testEndpoints().catch(console.error);