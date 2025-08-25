#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSection = (title) => {
  log('\n' + '='.repeat(60), 'cyan');
  log(`🚀 ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
};

const logTestResult = (testName, passed, duration) => {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? 'green' : 'red';
  log(`${status} ${testName} (${duration}ms)`, color);
};

// Ensure results directory exists
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Test results tracking
const testResults = {
  unit: { passed: 0, failed: 0, total: 0, duration: 0 },
  integration: { passed: 0, failed: 0, total: 0, duration: 0 },
  e2e: { passed: 0, failed: 0, total: 0, duration: 0 },
  performance: { passed: 0, failed: 0, total: 0, duration: 0 }
};

const runCommand = (command, description) => {
  try {
    log(`🔄 Running: ${description}`, 'yellow');
    const startTime = Date.now();
    const result = execSync(command, { 
      cwd: __dirname, 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    const duration = Date.now() - startTime;
    logTestResult(description, true, duration);
    return { success: true, duration, output: result };
  } catch (error) {
    const duration = Date.now() - startTime;
    logTestResult(description, false, duration);
    log(`Error: ${error.message}`, 'red');
    return { success: false, duration, output: error.stdout || error.message };
  }
};

const generateTestReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: Object.values(testResults).reduce((sum, result) => sum + result.total, 0),
      passed: Object.values(testResults).reduce((sum, result) => sum + result.passed, 0),
      failed: Object.values(testResults).reduce((sum, result) => sum + result.failed, 0),
      duration: Object.values(testResults).reduce((sum, result) => sum + result.duration, 0)
    },
    details: testResults,
    coverage: {
      unit: fs.existsSync(path.join(resultsDir, 'coverage/unit/coverage-summary.json')) 
        ? JSON.parse(fs.readFileSync(path.join(resultsDir, 'coverage/unit/coverage-summary.json')))
        : null,
      integration: fs.existsSync(path.join(resultsDir, 'coverage/integration/coverage-summary.json'))
        ? JSON.parse(fs.readFileSync(path.join(resultsDir, 'coverage/integration/coverage-summary.json')))
        : null
    }
  };

  const reportPath = path.join(resultsDir, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate HTML report
  const htmlReport = generateHTMLReport(report);
  const htmlPath = path.join(resultsDir, 'test-report.html');
  fs.writeFileSync(htmlPath, htmlReport);

  return report;
};

const generateHTMLReport = (report) => {
  const passRate = ((report.summary.passed / report.summary.total) * 100).toFixed(1);
  const status = report.summary.failed === 0 ? 'PASSED' : 'FAILED';
  const statusColor = report.summary.failed === 0 ? '#28a745' : '#dc3545';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PawfectRadar Quantum Test Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header .subtitle { margin: 10px 0 0 0; opacity: 0.9; }
        .status { background: ${statusColor}; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 10px 0; font-weight: bold; }
        .summary { padding: 30px; border-bottom: 1px solid #eee; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #495057; }
        .summary-card .number { font-size: 2em; font-weight: bold; color: #007bff; }
        .details { padding: 30px; }
        .test-section { margin: 20px 0; }
        .test-section h3 { color: #495057; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .test-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 15px 0; }
        .metric { background: #e9ecef; padding: 15px; border-radius: 6px; text-align: center; }
        .metric .label { font-size: 0.9em; color: #6c757d; }
        .metric .value { font-size: 1.2em; font-weight: bold; color: #495057; }
        .coverage { padding: 30px; background: #f8f9fa; }
        .coverage h3 { color: #495057; margin-bottom: 20px; }
        .coverage-bar { background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .coverage-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); transition: width 0.3s ease; }
        .footer { background: #343a40; color: white; padding: 20px; text-align: center; }
        .quantum-badge { background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 5px 15px; border-radius: 15px; font-size: 0.8em; margin-left: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐾 PawfectRadar <span class="quantum-badge">QUANTUM</span></h1>
            <p class="subtitle">Comprehensive Test Report</p>
            <div class="status">${status} - ${passRate}% Pass Rate</div>
        </div>
        
        <div class="summary">
            <h2>📊 Test Summary</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Total Tests</h3>
                    <div class="number">${report.summary.total}</div>
                </div>
                <div class="summary-card">
                    <h3>Passed</h3>
                    <div class="number" style="color: #28a745;">${report.summary.passed}</div>
                </div>
                <div class="summary-card">
                    <h3>Failed</h3>
                    <div class="number" style="color: #dc3545;">${report.summary.failed}</div>
                </div>
                <div class="summary-card">
                    <h3>Duration</h3>
                    <div class="number">${(report.summary.duration / 1000).toFixed(1)}s</div>
                </div>
            </div>
        </div>
        
        <div class="details">
            <h2>🔍 Test Details</h2>
            ${Object.entries(report.details).map(([type, result]) => `
                <div class="test-section">
                    <h3>${type.toUpperCase()} Tests</h3>
                    <div class="test-metrics">
                        <div class="metric">
                            <div class="label">Total</div>
                            <div class="value">${result.total}</div>
                        </div>
                        <div class="metric">
                            <div class="label">Passed</div>
                            <div class="value" style="color: #28a745;">${result.passed}</div>
                        </div>
                        <div class="metric">
                            <div class="label">Failed</div>
                            <div class="value" style="color: #dc3545;">${result.failed}</div>
                        </div>
                        <div class="metric">
                            <div class="label">Duration</div>
                            <div class="value">${(result.duration / 1000).toFixed(1)}s</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${report.coverage.unit || report.coverage.integration ? `
        <div class="coverage">
            <h2>📈 Code Coverage</h2>
            ${report.coverage.unit ? `
                <h3>Unit Tests</h3>
                <div class="coverage-bar">
                    <div class="coverage-fill" style="width: ${report.coverage.unit.total.lines.pct}%"></div>
                </div>
                <p>Lines: ${report.coverage.unit.total.lines.pct}% | Functions: ${report.coverage.unit.total.functions.pct}% | Branches: ${report.coverage.unit.total.branches.pct}%</p>
            ` : ''}
            ${report.coverage.integration ? `
                <h3>Integration Tests</h3>
                <div class="coverage-bar">
                    <div class="coverage-fill" style="width: ${report.coverage.integration.total.lines.pct}%"></div>
                </div>
                <p>Lines: ${report.coverage.integration.total.lines.pct}% | Functions: ${report.coverage.integration.total.functions.pct}% | Branches: ${report.coverage.integration.total.branches.pct}%</p>
            ` : ''}
        </div>
        ` : ''}
        
        <div class="footer">
            <p>Generated on ${new Date(report.timestamp).toLocaleString()} | PawfectRadar Quantum Testing Suite</p>
        </div>
    </div>
</body>
</html>
  `;
};

// Main test execution
async function runAllTests() {
  logSection('QUANTUM TEST SUITE EXECUTION');
  log('🚀 Starting comprehensive test execution for PawfectRadar...', 'bright');

  // Install dependencies if needed
  if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    logSection('Installing Test Dependencies');
    runCommand('npm install', 'Installing test dependencies');
  }

  // Unit Tests
  logSection('UNIT TESTS');
  const unitResult = runCommand('npm run test:unit', 'Backend Services & Frontend Components');
  testResults.unit = {
    passed: unitResult.success ? 1 : 0,
    failed: unitResult.success ? 0 : 1,
    total: 1,
    duration: unitResult.duration
  };

  // Integration Tests
  logSection('INTEGRATION TESTS');
  const integrationResult = runCommand('npm run test:integration', 'API Endpoints');
  testResults.integration = {
    passed: integrationResult.success ? 1 : 0,
    failed: integrationResult.success ? 0 : 1,
    total: 1,
    duration: integrationResult.duration
  };

  // E2E Tests
  logSection('END-TO-END TESTS');
  const e2eResult = runCommand('npm run test:e2e', 'Login, Booking, Messaging Flow');
  testResults.e2e = {
    passed: e2eResult.success ? 1 : 0,
    failed: e2eResult.success ? 0 : 1,
    total: 1,
    duration: e2eResult.duration
  };

  // Performance Tests
  logSection('PERFORMANCE TESTS');
  const performanceResult = runCommand('npm run test:performance', 'Load Testing on Booking API');
  testResults.performance = {
    passed: performanceResult.success ? 1 : 0,
    failed: performanceResult.success ? 0 : 1,
    total: 1,
    duration: performanceResult.duration
  };

  // Generate Report
  logSection('GENERATING TEST REPORT');
  const report = generateTestReport();
  
  log('\n📊 Test Execution Complete!', 'bright');
  log(`✅ Total Tests: ${report.summary.total}`, 'green');
  log(`✅ Passed: ${report.summary.passed}`, 'green');
  log(`❌ Failed: ${report.summary.failed}`, report.summary.failed > 0 ? 'red' : 'green');
  log(`⏱️  Total Duration: ${(report.summary.duration / 1000).toFixed(1)}s`, 'blue');
  
  log('\n📁 Test Results saved to:', 'cyan');
  log(`   📄 JSON Report: ${path.join(resultsDir, 'test-report.json')}`, 'cyan');
  log(`   🌐 HTML Report: ${path.join(resultsDir, 'test-report.html')}`, 'cyan');
  log(`   📊 Coverage: ${path.join(resultsDir, 'coverage/')}`, 'cyan');
  log(`   📈 Performance: ${path.join(resultsDir, 'load-test-results.json')}`, 'cyan');

  if (report.summary.failed > 0) {
    log('\n⚠️  Some tests failed. Please review the results above.', 'yellow');
    process.exit(1);
  } else {
    log('\n🎉 All tests passed! Quantum-grade quality achieved!', 'green');
  }
}

// Run the tests
runAllTests().catch(error => {
  log(`\n💥 Test execution failed: ${error.message}`, 'red');
  process.exit(1);
});
