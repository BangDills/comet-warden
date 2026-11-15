/**
 * Comet Warden - Input Management
 * Captures mouse and keyboard state, normalizes coordinates to canvas virtual space,
 * and exposes discrete action triggers and continuous axes.
 */

export function createInput(canvas) {
  const keysDown = new Set();
  const keysJustPressed = new Set();

  const mouse = {
    x: 640,
    y: 360,
    isDown: false,
    justPressed: false,
    justReleased: false,
    holdSeconds: 0,
    releaseHoldSeconds: 0,
    rightClicked: false,
  };

  function updateCanvasCoordinates(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    mouse.x = Math.max(0, Math.min(canvas.width, (clientX - rect.left) * scaleX));
    mouse.y = Math.max(0, Math.min(canvas.height, (clientY - rect.top) * scaleY));
  }

  function handleKeyDown(event) {
    const key = event.key;
    if (!keysDown.has(key)) {
      keysJustPressed.add(key);
      keysDown.add(key);
    }
    // Prevent scrolling from arrow keys / space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar'].includes(key)) {
      event.preventDefault();
    }
  }

  function handleKeyUp(event) {
    keysDown.delete(event.key);
  }

  function handleMouseDown(event) {
    updateCanvasCoordinates(event.clientX, event.clientY);
    if (event.button === 0) {
      // Left button
      mouse.isDown = true;
      mouse.justPressed = true;
      mouse.holdSeconds = 0;
    } else if (event.button === 2) {
      // Right button
      mouse.rightClicked = true;
      event.preventDefault();
    }
  }

  function handleMouseUp(event) {
    updateCanvasCoordinates(event.clientX, event.clientY);
    if (event.button === 0) {
      mouse.isDown = false;
      mouse.justReleased = true;
      mouse.releaseHoldSeconds = mouse.holdSeconds;
    }
  }

  function handleMouseMove(event) {
    updateCanvasCoordinates(event.clientX, event.clientY);
  }

  function handleContextMenu(event) {
    event.preventDefault();
  }

  // Bind window and canvas listeners
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  canvas.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('contextmenu', handleContextMenu);

  function isDown(key) {
    return keysDown.has(key);
  }

  function wasJustPressed(key) {
    return keysJustPressed.has(key);
  }

  function getThrustVector() {
    let dx = 0;
    let dy = 0;
    if (isDown('w') || isDown('W') || isDown('ArrowUp')) dy -= 1;
    if (isDown('s') || isDown('S') || isDown('ArrowDown')) dy += 1;
    if (isDown('a') || isDown('A') || isDown('ArrowLeft')) dx -= 1;
    if (isDown('d') || isDown('D') || isDown('ArrowRight')) dx += 1;

    const len = Math.hypot(dx, dy);
    if (len > 0.0001) {
      return { x: dx / len, y: dy / len, active: true };
    }
    return { x: 0, y: 0, active: false };
  }

  function pollClearWells() {
    if (mouse.rightClicked || wasJustPressed('x') || wasJustPressed('X')) {
      mouse.rightClicked = false;
      return true;
    }
    return false;
  }

  function pollPulse() {
    return wasJustPressed(' ') || wasJustPressed('Spacebar');
  }

  function pollPause() {
    return wasJustPressed('p') || wasJustPressed('P') || wasJustPressed('Escape');
  }

  function pollMute() {
    return wasJustPressed('m') || wasJustPressed('M');
  }

  function pollRestart() {
    return wasJustPressed('r') || wasJustPressed('R');
  }

  function pollConfirm() {
    return wasJustPressed('Enter') || wasJustPressed(' ') || mouse.justPressed;
  }

  function pollWellPlacement() {
    if (mouse.justReleased) {
      const hold = mouse.releaseHoldSeconds;
      mouse.justReleased = false;
      return {
        triggered: true,
        x: mouse.x,
        y: mouse.y,
        holdSeconds: hold,
      };
    }
    return { triggered: false, x: mouse.x, y: mouse.y, holdSeconds: 0 };
  }

  function update(dt) {
    if (mouse.isDown) {
      mouse.holdSeconds += dt;
    }
    // Clear just-pressed one-frame triggers at end of step
    keysJustPressed.clear();
    mouse.justPressed = false;
  }

  function destroy() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    canvas.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('contextmenu', handleContextMenu);
  }

  return {
    mouse,
    isDown,
    wasJustPressed,
    getThrustVector,
    pollClearWells,
    pollPulse,
    pollPause,
    pollMute,
    pollRestart,
    pollConfirm,
    pollWellPlacement,
    update,
    destroy,
  };
}
