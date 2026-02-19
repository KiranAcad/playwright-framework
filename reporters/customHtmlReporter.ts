import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';
import { logger, testStart, testEnd } from '../utils/logger';

type TestRunEntry = {
  title: string;
  file: string;
  status: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  errorMessage: string;
  screenshotBase64: string;
};

class CustomHtmlReporter implements Reporter {
  private startTime = 0;
  private endTime = 0;
  private testEntries = new Map<string, TestRunEntry>();
  private outputPath = '';

  onBegin(config: FullConfig, suite: Suite): void {
    this.startTime = Date.now();
    logger.info(
      `[REPORTER] Run started at ${new Date(this.startTime).toISOString()} with ${suite.allTests().length} tests`,
    );
  }

  onTestBegin(test: TestCase): void {
    const key = test.id;
    testStart(test.title);
    this.testEntries.set(key, {
      title: test.title,
      file: test.location.file,
      status: 'running',
      startedAt: new Date().toISOString(),
      endedAt: '',
      durationMs: 0,
      errorMessage: '',
      screenshotBase64: '',
    });
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const key = test.id;
    const existing = this.testEntries.get(key);
    const endedAt = new Date().toISOString();
    const startedAt = existing?.startedAt ?? endedAt;

    // Capture error messages
    const errorMessage = result.errors
      .map((e) => e.message ?? e.stack ?? 'Unknown error')
      .join('\n');

    // Capture screenshot on failure (base64-encoded data URI)
    let screenshotBase64 = '';
    if (result.status === 'failed' || result.status === 'timedOut') {
      const screenshotAttachment = result.attachments.find(
        (a) => a.name === 'screenshot' && a.contentType.startsWith('image/'),
      );
      if (screenshotAttachment) {
        try {
          let imgBuffer: Buffer | undefined;
          if (screenshotAttachment.body) {
            imgBuffer = screenshotAttachment.body;
          } else if (screenshotAttachment.path) {
            imgBuffer = fs.readFileSync(screenshotAttachment.path);
          }
          if (imgBuffer) {
            screenshotBase64 = `data:${screenshotAttachment.contentType};base64,${imgBuffer.toString('base64')}`;
            logger.info(`[REPORTER] Screenshot captured for failed test: ${test.title}`);
          }
        } catch (err) {
          logger.error(`[REPORTER] Failed to read screenshot for: ${test.title} — ${err}`);
        }
      }
    }

    this.testEntries.set(key, {
      title: test.title,
      file: test.location.file,
      status: result.status,
      startedAt,
      endedAt,
      durationMs: result.duration,
      errorMessage,
      screenshotBase64,
    });

    testEnd(test.title, result.status, result.duration);

    if (result.status === 'failed' || result.status === 'timedOut') {
      logger.error(`[REPORTER] FAILED: ${test.title} — ${errorMessage.split('\n')[0]}`);
    }
  }

  onEnd(result: FullResult): void {
    this.endTime = Date.now();
    const timestamp = new Date(this.startTime || this.endTime)
      .toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, 19);
    this.outputPath = path.resolve(process.cwd(), 'custom-report', `report-${timestamp}.html`);

    const entries = Array.from(this.testEntries.values());
    const passed = entries.filter((e) => e.status === 'passed').length;
    const failed = entries.filter((e) => e.status === 'failed').length;
    const skipped = entries.filter((e) => e.status === 'skipped').length;
    const timedOut = entries.filter((e) => e.status === 'timedOut').length;
    const interrupted = entries.filter((e) => e.status === 'interrupted').length;

    const html = this.buildHtml({
      runStatus: result.status,
      runStartedAt: new Date(this.startTime).toISOString(),
      runEndedAt: new Date(this.endTime).toISOString(),
      runDurationMs: this.endTime - this.startTime,
      total: this.testEntries.size,
      passed,
      failed,
      skipped,
      timedOut,
      interrupted,
      tests: entries,
    });

    fs.mkdirSync(path.dirname(this.outputPath), { recursive: true });
    fs.writeFileSync(this.outputPath, html, 'utf-8');
    logger.info(`[REPORTER] Custom HTML report generated at ${this.outputPath}`);
    logger.info(
      `[REPORTER] Summary — Total: ${this.testEntries.size} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`,
    );
  }

  private buildHtml(data: {
    runStatus: string;
    runStartedAt: string;
    runEndedAt: string;
    runDurationMs: number;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    timedOut: number;
    interrupted: number;
    tests: TestRunEntry[];
  }): string {
    const passRate = data.total > 0 ? ((data.passed / data.total) * 100).toFixed(1) : '0';

    const rows = data.tests
      .map((test, index) => {
        const errorRow = test.errorMessage
          ? `<tr class="error-row">
               <td colspan="7">
                 <details>
                   <summary>🔍 Error Details</summary>
                   <pre class="error-pre">${this.escapeHtml(test.errorMessage)}</pre>
                 </details>
               </td>
             </tr>`
          : '';

        const screenshotRow = test.screenshotBase64
          ? `<tr class="error-row screenshot-row">
               <td colspan="7">
                 <details>
                   <summary>📸 Failure Screenshot</summary>
                   <div class="screenshot-container">
                     <img src="${test.screenshotBase64}" alt="Failure screenshot for ${this.escapeHtml(test.title)}" />
                   </div>
                 </details>
               </td>
             </tr>`
          : '';

        return `
          <tr class="test-row ${test.status}">
            <td class="row-num">${index + 1}</td>
            <td class="test-name">${this.escapeHtml(test.title)}</td>
            <td class="test-file">${this.escapeHtml(path.basename(test.file))}</td>
            <td class="status-cell"><span class="badge ${test.status}">${test.status.toUpperCase()}</span></td>
            <td class="timestamp">${this.formatTimestamp(test.startedAt)}</td>
            <td class="timestamp">${this.formatTimestamp(test.endedAt)}</td>
            <td class="duration">${this.formatDuration(test.durationMs)}</td>
          </tr>
          ${errorRow}
          ${screenshotRow}
        `;
      })
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Test Execution Report — ${this.formatTimestamp(data.runStartedAt)}</title>
  <style>
    :root {
      --bg: #0f172a;
      --surface: #1e293b;
      --surface-hover: #334155;
      --border: #334155;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
      --accent: #6366f1;
      --green: #22c55e;
      --red: #ef4444;
      --orange: #f97316;
      --yellow: #eab308;
      --blue: #3b82f6;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 32px;
      min-height: 100vh;
    }

    .header {
      background: linear-gradient(135deg, var(--accent) 0%, #8b5cf6 50%, #a855f7 100%);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
    }
    .header .run-status {
      font-size: 14px;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header .run-status.passed { background: rgba(34,197,94,0.25); color: var(--green); }
    .header .run-status.failed { background: rgba(239,68,68,0.25); color: var(--red); }

    /* Environment Info */
    .env-bar {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px 24px;
      margin-bottom: 24px;
      font-size: 13px;
      color: var(--text-muted);
    }
    .env-bar span { white-space: nowrap; }
    .env-bar strong { color: var(--text); }

    /* Progress Bar */
    .progress-container {
      margin-bottom: 24px;
      background: var(--surface);
      border-radius: 12px;
      padding: 20px 24px;
      border: 1px solid var(--border);
    }
    .progress-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: 600;
    }
    .progress-bar {
      height: 12px;
      border-radius: 6px;
      background: var(--border);
      overflow: hidden;
      display: flex;
    }
    .progress-bar .segment-passed { background: var(--green); }
    .progress-bar .segment-failed { background: var(--red); }
    .progress-bar .segment-skipped { background: var(--orange); }

    /* Summary Cards */
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover {
      transform: translateY(-2px);
      border-color: var(--accent);
    }
    .card .card-value {
      font-size: 32px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 4px;
    }
    .card .card-label {
      font-size: 13px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .card.total .card-value { color: var(--blue); }
    .card.passed .card-value { color: var(--green); }
    .card.failed .card-value { color: var(--red); }
    .card.skipped .card-value { color: var(--orange); }
    .card.timed-out .card-value { color: var(--yellow); }
    .card.duration .card-value { color: var(--accent); font-size: 24px; }

    /* Table */
    .table-wrapper {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background: rgba(99,102,241,0.15);
      padding: 14px 16px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 12px 16px;
      font-size: 14px;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    .test-row:hover { background: var(--surface-hover); }
    .row-num { color: var(--text-muted); width: 40px; text-align: center; }
    .test-name { font-weight: 500; }
    .test-file { color: var(--text-muted); font-size: 13px; }
    .timestamp { font-size: 12px; color: var(--text-muted); white-space: nowrap; }
    .duration { font-weight: 600; white-space: nowrap; }

    /* Status Badges */
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .badge.passed { background: rgba(34,197,94,0.2); color: var(--green); }
    .badge.failed { background: rgba(239,68,68,0.2); color: var(--red); }
    .badge.timedOut { background: rgba(234,179,8,0.2); color: var(--yellow); }
    .badge.skipped { background: rgba(249,115,22,0.2); color: var(--orange); }
    .badge.interrupted { background: rgba(239,68,68,0.2); color: var(--red); }

    /* Error details */
    .error-row td {
      padding: 0 16px 12px 16px;
      border-bottom: 1px solid var(--border);
    }
    .error-row details {
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 8px;
      padding: 12px;
    }
    .error-row summary {
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      color: var(--red);
    }
    .error-pre {
      margin-top: 8px;
      font-size: 12px;
      color: #fca5a5;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 300px;
      overflow-y: auto;
    }

    /* Screenshot display */
    .screenshot-row details {
      background: rgba(99,102,241,0.08);
      border: 1px solid rgba(99,102,241,0.25);
      border-radius: 8px;
      padding: 12px;
    }
    .screenshot-row summary {
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      color: var(--accent);
    }
    .screenshot-container {
      margin-top: 10px;
    }
    .screenshot-container img {
      max-width: 100%;
      border-radius: 8px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    .footer {
      text-align: center;
      margin-top: 24px;
      font-size: 12px;
      color: var(--text-muted);
    }

    @media (max-width: 768px) {
      body { padding: 16px; }
      .header { padding: 20px; }
      .header h1 { font-size: 20px; }
      .summary { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>

  <div class="header">
    <h1>🎭 Playwright Test Report</h1>
    <span class="run-status ${data.runStatus}">${data.runStatus}</span>
  </div>

  <div class="env-bar">
    <span>📅 <strong>Started:</strong> ${this.formatTimestamp(data.runStartedAt)}</span>
    <span>🏁 <strong>Ended:</strong> ${this.formatTimestamp(data.runEndedAt)}</span>
    <span>⏱️ <strong>Duration:</strong> ${this.formatDuration(data.runDurationMs)}</span>
    <span>🖥️ <strong>Platform:</strong> ${process.platform} / Node ${process.version}</span>
  </div>

  <div class="progress-container">
    <div class="progress-label">
      <span>Pass Rate</span>
      <span>${passRate}%</span>
    </div>
    <div class="progress-bar">
      <div class="segment-passed" style="width: ${data.total > 0 ? (data.passed / data.total) * 100 : 0}%"></div>
      <div class="segment-failed" style="width: ${data.total > 0 ? (data.failed / data.total) * 100 : 0}%"></div>
      <div class="segment-skipped" style="width: ${data.total > 0 ? ((data.skipped + data.timedOut + data.interrupted) / data.total) * 100 : 0}%"></div>
    </div>
  </div>

  <div class="summary">
    <div class="card total">
      <div class="card-value">${data.total}</div>
      <div class="card-label">Total</div>
    </div>
    <div class="card passed">
      <div class="card-value">${data.passed}</div>
      <div class="card-label">✅ Passed</div>
    </div>
    <div class="card failed">
      <div class="card-value">${data.failed}</div>
      <div class="card-label">❌ Failed</div>
    </div>
    <div class="card skipped">
      <div class="card-value">${data.skipped}</div>
      <div class="card-label">⏭️ Skipped</div>
    </div>
    <div class="card timed-out">
      <div class="card-value">${data.timedOut}</div>
      <div class="card-label">⏰ Timed Out</div>
    </div>
    <div class="card duration">
      <div class="card-value">${this.formatDuration(data.runDurationMs)}</div>
      <div class="card-label">⏱️ Duration</div>
    </div>
  </div>

  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Test Name</th>
          <th>File</th>
          <th>Status</th>
          <th>Started At</th>
          <th>Ended At</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>

  <div class="footer">
    Report generated on ${this.formatTimestamp(new Date().toISOString())} by Playwright Custom Reporter
  </div>

</body>
</html>`;
  }

  private formatTimestamp(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(1);
    return `${minutes}m ${seconds}s`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

export default CustomHtmlReporter;
