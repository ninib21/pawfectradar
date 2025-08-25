#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Android APK Build for PawfectRadar...\n');

// Check if we're in the right directory
if (!fs.existsSync('app.json')) {
  console.error('❌ Error: app.json not found. Please run this script from the frontend directory.');
  process.exit(1);
}

// Check if eas-cli is installed
try {
  execSync('npx eas --version', { stdio: 'pipe' });
  console.log('✅ EAS CLI is available');
} catch (error) {
  console.error('❌ Error: EAS CLI not found. Please install it first:');
  console.error('npm install --save-dev eas-cli');
  process.exit(1);
}

// Function to run commands with error handling
function runCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

// Main build process
async function buildAndroid() {
  console.log('\n🔧 Build Configuration:');
  console.log('- Platform: Android');
  console.log('- Profile: Preview');
  console.log('- Build Type: APK');
  console.log('- Package: com.pawfectradar.app\n');

  // Step 1: Check if user is logged in
  console.log('🔐 Checking Expo login status...');
  try {
    execSync('npx eas whoami', { stdio: 'pipe' });
    console.log('✅ User is logged in to Expo');
  } catch (error) {
    console.log('⚠️  User not logged in. Please login first:');
    console.log('npx eas login');
    process.exit(1);
  }

  // Step 2: Build the APK
  const buildSuccess = runCommand(
    'npx eas build --platform android --profile preview',
    'Building Android APK'
  );

  if (buildSuccess) {
    console.log('\n🎉 Android APK build completed successfully!');
    console.log('\n📱 Next Steps:');
    console.log('1. Download the APK from the EAS dashboard');
    console.log('2. Install on your Android device for testing');
    console.log('3. Test all features thoroughly');
    console.log('4. Build production AAB when ready for app store');
    
    console.log('\n🔗 EAS Dashboard: https://expo.dev/accounts/ninib21/projects/pawfectradar-mobile');
  } else {
    console.log('\n❌ Build failed. Please check the error messages above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify your Expo account has build credits');
    console.log('3. Try building locally with: npx expo run:android');
    console.log('4. Check EAS documentation: https://docs.expo.dev/eas/');
  }
}

// Run the build
buildAndroid().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
