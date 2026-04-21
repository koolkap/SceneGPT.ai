const app = document.getElementById('app');
if (app) {
  app.innerHTML = `
    <div style="text-align:center;max-width:640px;padding:24px">
      <h1 style="margin:0 0 10px">Game Workspace Ready</h1>
      <p style="margin:0;color:#94a3b8">
                Start editing <strong>index.html</strong> and <strong>init.js</strong>,
        then click Build to run your project.
      </p>
    </div>
  `;
}
