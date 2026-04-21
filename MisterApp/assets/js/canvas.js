function disegnaSchemaCanvas(containerId, descrizione) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
  canvas.style.borderRadius = '12px';
  canvas.style.backgroundColor = '#2ecc71';
  
  const ctx = canvas.getContext('2d');
  
  // Sfondo campo
  ctx.fillStyle = '#27ae60';
  ctx.fillRect(0, 0, 400, 300);
  
  // Linee campo
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 360, 260);
  
  // Linea metà campo
  ctx.beginPath();
  ctx.moveTo(200, 20);
  ctx.lineTo(200, 280);
  ctx.stroke();
  
  // Cerchio centrocampo
  ctx.beginPath();
  ctx.arc(200, 150, 40, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Punto centrale
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(200, 150, 4, 0, 2 * Math.PI);
  ctx.fill();
  
  // Aree di rigore
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 90, 50, 120);
  ctx.strokeRect(330, 90, 50, 120);
  
  // Giocatori (interpretazione base)
  const giocatoriCount = (descrizione.match(/giocatori?[:\s]*(\d+)/i) || [])[1] || 8;
  const count = Math.min(parseInt(giocatoriCount) || 8, 10);
  
  ctx.fillStyle = '#3498db';
  for (let i = 0; i < count; i++) {
    const x = 60 + (i % 4) * 80 + Math.random() * 20;
    const y = 50 + Math.floor(i / 4) * 100 + Math.random() * 30;
    
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#3498db';
    ctx.fill();
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i + 1, x, y);
  }
  
  // Etichetta
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(10, 270, 380, 25);
  ctx.fillStyle = '#ffffff';
  ctx.font = '11px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Schema semplificato - Adatta spazi in base al numero di giocatori', 200, 286);
  
  container.innerHTML = '';
  container.appendChild(canvas);
}