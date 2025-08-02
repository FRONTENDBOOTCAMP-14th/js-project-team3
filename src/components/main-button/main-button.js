function extractBodyContent(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const bodyElement = tempDiv.querySelector("body");
  return bodyElement ? bodyElement.innerHTML : html;
}

export async function renderMainButton(targetElement) {
  if (!targetElement) return;

  const html = `
    <button class="main-button" onclick="window.routeTo('score')">View Game Stats!</button>
    `;

  targetElement.innerHTML = html;
}
