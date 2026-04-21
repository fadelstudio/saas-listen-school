import 'dotenv/config';
import { systemService } from '../src/modules/system/system.service';

async function testAvailableModels() {
  console.log('--- Testing getAvailableModels ---');
  try {
    const models = await systemService.getAvailableModels();
    console.log('SUCCESS:', JSON.stringify(models, null, 2));
  } catch (err) {
    console.error('FAILED:', err);
  }
}

testAvailableModels();
