import * as THREE from 'three';
//generate diagonals from opposite vertices

//gnerate diagonals in the same plane

// generate all indices in gridState that could produce a horizontal, vertical or diagonal vector of length n

// this is to make the buttons to choose red or blue first or second player

// thiz is supposed to only reset game state variables

//
// this function was made to help the user see where the growing columns are

// this is supposed show the current placement of the selected xz column

// once all possible 2 or 3 length paths this is the next step

// this then removes cylinders that have been created

// this will add a sphere unless a column is n high, n being 4 in this case

// let directions = ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"];

// --- Selector Update ---


function addSphere(x, z, player) {
  console.log("add sphere");
  if (columnHeights[x][z] >= cubeSize) return false;

  const y = columnHeights[x][z]++;
  gridState[x][y][z] = currentPlayer;
  const color = currentPlayer === 1 ? 0xff3333 : 0x3399ff;
  const mat = new THREE.MeshStandardMaterial({ color });

  const s = new THREE.Mesh(sphereGeo, mat);
  s.position.set(
    (x - (cubeSize - 1) / 2) * spacing,
    (y - (cubeSize - 1) / 2) * spacing,
    (z - (cubeSize - 1) / 2) * spacing
  ); //

  console.log("length of scene objects b4:  ", scene.children.length);
  scene.add(s);
  console.log("length of scene objects after:  ", scene.children.length);

  // Display sphere coordinates
  const coordEntry = document.createElement("div");
  coordEntry.innerText = `Sphere: (${x}, ${y}, ${z})`;
  coordEntry.style.color = "white";
  coordEntry.style.fontSize = "14px";
  console.log(`Sphere: (${x}, ${y}, ${z})`);

  if (columnHeights[x][z] === cubeSize) {
    columnMeshes[x][z].material.color.set(0xffff88);
    columnMeshes[x][z].material.opacity = 1.8;
  }

  // Update column height mesh
  scene.remove(columnMeshes[x][z]);
  const newHeight = columnHeights[x][z] * spacing;
  const newCol = new THREE.Mesh(
    new THREE.CylinderGeometry(columnRadius, columnRadius, newHeight, 16),
    grayMat.clone()
  );
  newCol.position.set(
    (x - (cubeSize - 1) / 2) * spacing,
    newHeight / 2 - (cubeSize / 2) * spacing,
    (z - (cubeSize - 1) / 2) * spacing
  );
  scene.add(newCol);
  columnMeshes[x][z] = newCol;

  checkForWin(currentPlayer);
  console.log(gridState);
  // checkAlignedDiagonals(x, y, z, currentPlayer);

  return true;
}

function aiMove(aiPlayer) {
  console.log("ai move");
  if (gameOver) {
    console.log("alsdkjfalkdfj");
    return;
  }

  moveInProgress = true; // Start of AI move

  const threats = getHumanThreesAndTwos(gridState, 4, humanPlayer);
  if (threats[0].length > 0) {
    const [line, values] = threats[0][0];
    const zeroIndex = values.findIndex((v) => v === 0);
    const [x, , z] = line[zeroIndex];
    makeMove(x, z, aiPlayer);
    return;
  }

  for (let x = 0; x < cubeSize; x++) {
    for (let z = 0; z < cubeSize; z++) {
      if (columnHeights[x][z] < cubeSize) {
        const y = columnHeights[x][z];
        gridState[x][y][z] = aiPlayer;
        columnHeights[x][z]++;

        let count = 1;
        const directions = [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
          [1, 1, 0],
          [1, 0, 1],
          [0, 1, 1],
          [1, 1, 1],
          [-1, 1, 0],
          [0, 1, -1],
          [1, -1, 0],
          [1, 1, -1],
          [-1, 1, 1],
          [1, -1, -1],
          [1, 0, -1],
          [-1, 0, 1],
          [-1, 0, -1],
          [-1, 1, -1]
        ];

        for (const [dx, dy, dz] of directions) {
          let tempCount = 1;
          for (let i = 1; i < 4; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            const nz = z + dz * i;
            if (
              nx >= 0 &&
              ny >= 0 &&
              nz >= 0 &&
              nx < cubeSize &&
              ny < cubeSize &&
              nz < cubeSize &&
              gridState[nx][ny][nz] === aiPlayer
            ) {
              tempCount++;
            } else break;
          }

          for (let i = 1; i < 4; i++) {
            const nx = x - dx * i;
            const ny = y - dy * i;
            const nz = z - dz * i;
            if (
              nx >= 0 &&
              ny >= 0 &&
              nz >= 0 &&
              nx < cubeSize &&
              ny < cubeSize &&
              nz < cubeSize &&
              gridState[nx][ny][nz] === aiPlayer
            ) {
              tempCount++;
            } else break;
          }

          count = Math.max(count, tempCount);
        }

        gridState[x][y][z] = 0;
        columnHeights[x][z]--;

        if (count >= 4) {
          makeMove(x, z, aiPlayer);
          return;
        }
      }
    }
  }

  const validMoves = [];
  for (let x = 0; x < cubeSize; x++) {
    for (let z = 0; z < cubeSize; z++) {
      if (columnHeights[x][z] < cubeSize) validMoves.push([x, z]);
    }
  }

  console.log("towards end of ");
  if (validMoves.length) {
    const [x, z] = validMoves[Math.floor(Math.random() * validMoves.length)];
    makeMove(x, z, aiPlayer);
  }

  // If we get here and no makeMove succeeded, reset state
  moveInProgress = false;
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  TWEEN.update?.();

  const pos = camera.position;
  const rot = camera.rotation;
  cameraInfo.innerText = `Camera\nPosition: (${pos.x.toFixed(
    2
  )}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(
    2
  )})\nRotation: (${THREE.MathUtils.radToDeg(rot.x).toFixed(
    1
  )}°, ${THREE.MathUtils.radToDeg(rot.y).toFixed(
    1
  )}°, ${THREE.MathUtils.radToDeg(rot.z).toFixed(1)}°)`;

  renderer.render(scene, camera);
}

function celebrateWin(line, player) {
  gameOver = true;
  window.removeEventListener("keydown", eventListenerKeys);

  const color = player === 1 ? "red" : "blue";
  const originalColor = currentPlayer === 1 ? 0xff3333 : 0x3399ff;
  const duration = 500;
  const glowSpheres = [];

  line.forEach(([x, y, z]) => {
    const glow = new THREE.Mesh(
      sphereGeo,
      new THREE.MeshStandardMaterial({ color: 0xffff00 })
    );
    glow.position.set(
      (x - (cubeSize - 1) / 2) * spacing,
      (y - (cubeSize - 1) / 2) * spacing,
      (z - (cubeSize - 1) / 2) * spacing
    );
    scene.add(glow);
    glowSpheres.push({ mesh: glow, x, y, z });

    const scaleUp = { scale: 1 };
    new TWEEN.Tween(scaleUp)
      .to({ scale: 2 }, duration)
      .onUpdate(() => {
        glow.scale.set(scaleUp.scale, scaleUp.scale, scaleUp.scale);
      })
      .start();
  });

  setTimeout(() => {
    glowSpheres.forEach(({ mesh }) => {
      const scaleDown = { scale: 2 };
      new TWEEN.Tween(scaleDown)
        .to({ scale: 1 }, duration)
        .onUpdate(() => {
          mesh.scale.set(scaleDown.scale, scaleDown.scale, scaleDown.scale);
        })
        .start();

      const startColor = new THREE.Color(0xffff00);
      const endColor = new THREE.Color(originalColor);
      const colorObj = { t: 0 };
      new TWEEN.Tween(colorObj)
        .to({ t: 1 }, duration)
        .onUpdate(() => {
          mesh.material.color.copy(
            startColor.clone().lerp(endColor, colorObj.t)
          );
        })
        .start();
    });
  }, duration);

  setTimeout(() => {
    showWinDialog(color);
  }, duration * 2 + 100);
}

function checkAlignedDiagonals(x, y, z, player) {
  const directions = [
    [1, 1, 0],
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 1],
    [-1, 1, 0],
    [0, 1, -1],
    [1, -1, 0],
    [1, 1, -1],
    [-1, 1, 1],
    [1, -1, -1],
    [1, 0, -1],
    [-1, 0, 1],
    [-1, 1, -1],
    [-1, -1, 1]
  ];

  directions.forEach(([dx, dy, dz]) => {
    const line = [[x, y, z]];

    // Forward
    for (let i = 1; i < cubeSize; i++) {
      const nx = x + i * dx;
      const ny = y + i * dy;
      const nz = z + i * dz;
      if (
        nx < 0 ||
        ny < 0 ||
        nz < 0 ||
        nx >= cubeSize ||
        ny >= cubeSize ||
        nz >= cubeSize
      )
        break;
      if (gridState[nx][ny][nz] === gridState[x][y][z]) line.push([nx, ny, nz]);
      else break;
    }

    // Backward
    for (let i = 1; i < cubeSize; i++) {
      const nx = x - i * dx;
      const ny = y - i * dy;
      const nz = z - i * dz;
      if (
        nx < 0 ||
        ny < 0 ||
        nz < 0 ||
        nx >= cubeSize ||
        ny >= cubeSize ||
        nz >= cubeSize
      )
        break;
      if (gridState[nx][ny][nz] === gridState[x][y][z])
        line.unshift([nx, ny, nz]);
      else break;
    }

    // if (line.length >= 2) {
    //   console.log("Aligned Diagonal:", line);
    // }
  });
}

function checkForWin(player) {
  const directions = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 1],
    [-1, 1, 0],
    [0, 1, -1],
    [1, -1, 0],
    [1, 1, -1],
    [-1, 1, 1],
    [1, -1, -1],
    [1, 0, 1],
    [-1, 0, 1],
    [1, 0, -1],
    [-1, 0, -1],
    [1, 1, 1],
    [-1, 1, 1],
    [1, 1, -1],
    [-1, 1, -1]
  ];

  for (let x = 0; x < cubeSize; x++) {
    for (let y = 0; y < cubeSize; y++) {
      for (let z = 0; z < cubeSize; z++) {
        for (const [dx, dy, dz] of directions) {
          const line = [];

          for (let i = 0; i < 4; i++) {
            const nx = x + i * dx;
            const ny = y + i * dy;
            const nz = z + i * dz;

            if (
              nx < 0 ||
              nx >= cubeSize ||
              ny < 0 ||
              ny >= cubeSize ||
              nz < 0 ||
              nz >= cubeSize
            )
              break;

            if (gridState[nx][ny][nz] === player) {
              line.push([nx, ny, nz]);
            } else {
              break;
            }
          }

          if (line.length === 4) {
            celebrateWin(line, player);
            return;
          }
        }
      }
    }
  }
}


function createDirectionButtons() {
  //
  const directionBtnContainer = document.createElement("div");
  directionBtnContainer.id = "mobileControls"; // <-- Add this
  directionBtnContainer.style = `
    position: absolute;
    top: 10px;
    left: 10px;
    display: grid;
    grid-template-columns: 50px 50px 50px;
    grid-template-rows: 50px 50px 50px;
    gap: 5px;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.2);
    padding: 10px;
    border-radius: 10px;
    z-index: 999;
    transition: transform 0.3s ease;
  `;

  const layout = [
    null,
    "ArrowUp",
    null,
    "ArrowLeft",
    "Space",
    "ArrowRight",
    null,
    "ArrowDown",
    null
  ];

  layout.forEach((code) => {
    const btn = document.createElement("button");

    if (code === "ArrowUp") btn.textContent = "⬆️";
    else if (code === "ArrowDown") btn.textContent = "⬇️";
    else if (code === "ArrowLeft") btn.textContent = "⬅️";
    else if (code === "ArrowRight") btn.textContent = "➡️";
    else if (code === "Space") btn.textContent = "⏎";
    else {
      btn.style.visibility = "hidden";
      directionBtnContainer.appendChild(btn);
      return;
    }

    btn.style = `
      width: 50px;
      height: 50px;
      font-size: 24px;
      background: #666;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    `;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    );
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(
      camera.quaternion
    );
    const worldUp = new THREE.Vector3(0, 1, 0);
    const upsideDown = cameraUp.dot(worldUp) < 0;
    btn.onclick = () => {

      if (!inputEnabled) return;
      move = { x: 0, z: 0 };

      if (code === "ArrowUp") {
        console.log("arrow up on mobile controls");
        if (Math.abs(forward.z) > Math.abs(forward.x)) {
          move = { axis: "z", dir: forward.z < 0 ? -1 : 1 };
        } else {
          move = { axis: "x", dir: forward.x < 0 ? -1 : 1 };
        }
      }

      if (code === "ArrowDown") {
        if (Math.abs(forward.z) > Math.abs(forward.x)) {
          move = { axis: "z", dir: forward.z < 0 ? 1 : -1 };
        } else {
          move = { axis: "x", dir: forward.x < 0 ? 1 : -1 };
        }
      }

      if (code === "ArrowRight") {
        if (Math.abs(right.z) > Math.abs(right.x)) {
          move = { axis: "z", dir: right.z < 0 ? -1 : 1 };
        } else {
          move = { axis: "x", dir: right.x < 0 ? -1 : 1 };
        }
      }

      if (code === "ArrowLeft") {
        if (Math.abs(right.z) > Math.abs(right.x)) {
          move = { axis: "z", dir: right.z < 0 ? 1 : -1 };
        } else {
          move = { axis: "x", dir: right.x < 0 ? 1 : -1 };
        }
      } else if (code === "Space") {
        makeMove(selectedX, selectedZ, currentPlayer);
        return;
      }
      if (move.axis === "x") {
        selectedX = (selectedX + move.dir + cubeSize) % cubeSize;
      } else if (move.axis === "z") {
        selectedZ = (selectedZ + move.dir + cubeSize) % cubeSize;
      }
      updateSelector();
    };

    directionBtnContainer.appendChild(btn);
  });

  return directionBtnContainer;
}


function disableKeyboardInput() {
  window.removeEventListener("keydown", eventListenerKeys);
}

function drawCylinderBetweenPoints(
  p1,
  p2,
  radius = 0.05,
  color = 0xffff00,
  opacity = 1.0
) {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  const cylinderGeo = new THREE.CylinderGeometry(radius, radius, len, 8);
  const cylinderMat = new THREE.MeshStandardMaterial({
    color,
    transparent: opacity < 1,
    opacity
  });
  const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);

  cylinder.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
  cylinder.position.copy(mid);

  scene.add(cylinder);
  return cylinder;
}

function enableKeyboardInput() {
  window.addEventListener("keydown", eventListenerKeys);
}

function eventListenerKeys(e) {
  if (!inputEnabled) return;

  let forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(
    camera.quaternion
  );
  const worldUp = new THREE.Vector3(0, 1, 0);
  const upsideDown = cameraUp.dot(worldUp) < 0;

  console.log("forward:", forward);
  console.log("right:", right);
  console.log("upsideDown:", upsideDown);

  let move = null;

  if (e.code === "ArrowUp") {
    if (Math.abs(forward.z) > Math.abs(forward.x)) {
      move = { axis: "z", dir: forward.z < 0 ? -1 : 1 };
    } else {
      move = { axis: "x", dir: forward.x < 0 ? -1 : 1 };
    }
  }

  if (e.code === "ArrowDown") {
    if (Math.abs(forward.z) > Math.abs(forward.x)) {
      move = { axis: "z", dir: forward.z < 0 ? 1 : -1 };
    } else {
      move = { axis: "x", dir: forward.x < 0 ? 1 : -1 };
    }
  }

  if (e.code === "ArrowRight") {
    if (Math.abs(right.z) > Math.abs(right.x)) {
      move = { axis: "z", dir: right.z < 0 ? -1 : 1 };
    } else {
      move = { axis: "x", dir: right.x < 0 ? -1 : 1 };
    }
  }

  if (e.code === "ArrowLeft") {
    if (Math.abs(right.z) > Math.abs(right.x)) {
      move = { axis: "z", dir: right.z < 0 ? 1 : -1 };
    } else {
      move = { axis: "x", dir: right.x < 0 ? 1 : -1 };
    }
  }

  if (e.code === "Space") {
    e.preventDefault();
    makeMove(selectedX, selectedZ);
    return;
  }

  // Flip directions if the camera is upside down
  if (move) {
    move.dir *= upsideDown ? -1 : 1;
    if (move.axis === "x") {
      selectedX = (selectedX + move.dir + cubeSize) % cubeSize;
    } else {
      selectedZ = (selectedZ + move.dir + cubeSize) % cubeSize;
    }
    updateSelector();
  }
}

function generateAllDiagonalIndices(n = 4) {
  const permutations = [
    ["x", "y", "z"],
    ["x", "z", "y"],
    ["y", "x", "z"],
    ["y", "z", "x"],
    ["z", "x", "y"],
    ["z", "y", "x"]
  ];

  const idx = { x: 0, y: 1, z: 2 };
  const horizontals_and_verticals = [];

  for (const [a, b, c] of permutations) {
    const group = [];

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const line = [];
        for (let k = 0; k < n; k++) {
          const coord = [];
          coord[idx[a]] = i;
          coord[idx[b]] = j;
          coord[idx[c]] = k;
          line.push(coord);
        }

        horizontals_and_verticals.push(line);
      }
    }
  }

  generateSpaceDiagonals(n).forEach((i) => horizontals_and_verticals.push(i));

  generatePlanarDiagonals(n).forEach((i) => horizontals_and_verticals.push(i));
  return horizontals_and_verticals; // Array of 6 groups, each group is 16 lines of 4 points
}

function generateCubeDiagonals(n) {
  const diagonals = [];

  // --- Space diagonals (4 total) ---
  const directions = [
    [1, 1, 1],
    [1, 1, -1],
    [1, -1, 1],
    [1, -1, -1]
  ];
  const starts = [
    [0, 0, 0],
    [0, 0, n - 1],
    [0, n - 1, 0],
    [0, n - 1, n - 1]
  ];

  for (let d = 0; d < 4; d++) {
    const [sx, sy, sz] = starts[d];
    const [dx, dy, dz] = directions[d];
    const diag = [];
    for (let i = 0; i < n; i++) {
      diag.push([sx + i * dx, sy + i * dy, sz + i * dz]);
    }
    diagonals.push(diag);
  }

  // --- XY plane diagonals ---
  for (let z = 0; z < n; z++) {
    const diag1 = [],
      diag2 = [];
    for (let i = 0; i < n; i++) {
      diag1.push([i, i, z]);
      diag2.push([i, n - 1 - i, z]);
    }
    diagonals.push(diag1, diag2);
  }

  // --- XZ plane diagonals ---
  for (let y = 0; y < n; y++) {
    const diag1 = [],
      diag2 = [];
    for (let i = 0; i < n; i++) {
      diag1.push([i, y, i]);
      diag2.push([i, y, n - 1 - i]);
    }
    diagonals.push(diag1, diag2);
  }

  // --- YZ plane diagonals ---
  for (let x = 0; x < n; x++) {
    const diag1 = [],
      diag2 = [];
    for (let i = 0; i < n; i++) {
      diag1.push([x, i, i]);
      diag2.push([x, i, n - 1 - i]);
    }
    diagonals.push(diag1, diag2);
  }

  return diagonals;
}

function generatePlanarDiagonals(n = 4) {
  const planes = [
    ["x", "y", "z"], // fixed z (XY plane)
    ["x", "z", "y"], // fixed y (XZ plane)
    ["y", "z", "x"] // fixed x (YZ plane)
  ];

  const idx = { x: 0, y: 1, z: 2 };
  const planar_diagonals = [];

  for (const [a, b, fixed] of planes) {
    const group = [];

    for (let f = 0; f < n; f++) {
      const diag1 = [];
      const diag2 = [];

      for (let i = 0; i < n; i++) {
        const coord1 = [];
        const coord2 = [];

        coord1[idx[a]] = i;
        coord1[idx[b]] = i;
        coord1[idx[fixed]] = f;

        coord2[idx[a]] = n - 1 - i;
        coord2[idx[b]] = i;
        coord2[idx[fixed]] = f;

        diag1.push(coord1);
        diag2.push(coord2);
      }

      planar_diagonals.push(diag1, diag2); // ↘ and ↙
    }
  }
  return planar_diagonals;
}

function generateSpaceDiagonals(n = 4) {
  const startsAndDirs = [
    { start: [0, 0, 0], dx: 1, dy: 1, dz: 1 },
    { start: [n - 1, 0, 0], dx: -1, dy: 1, dz: 1 },
    { start: [0, n - 1, 0], dx: 1, dy: -1, dz: 1 },
    { start: [n - 1, n - 1, 0], dx: -1, dy: -1, dz: 1 }
  ];

  return startsAndDirs.map(({ start, dx, dy, dz }) =>
    Array.from({ length: n }, (_, i) => [
      start[0] + i * dx,
      start[1] + i * dy,
      start[2] + i * dz
    ])
  );
}

function getHumanThreesAndTwos(gridState, cubeSize, otherPlayer) {
  const diagonals = generateAllDiagonalIndices(cubeSize);
  console.log("elngth of diagonals = ", diagonals.length);
  const three_of = [];
  const two_of = [];
  for (const diag of diagonals) {
    const values = diag.map(([x, y, z]) => gridState[x][y][z]);
    const countOthers = values.filter((v) => v === otherPlayer).length;
    const countZeros = values.filter((v) => v === 0).length;
    let vector = diag.map(([x, y, z]) => gridState[x][y][z]);

    if (countOthers === 3 && countZeros === 1) {
      three_of.push([diag, vector]);
    }
    if (countOthers === 2 && countZeros === 2) {
      two_of.push([diag, vector]);
    }
  }

  return [three_of, two_of]; // List of diagonals with exactly 3 humanPlayer (2) and 1 empty
}

function handleMoveInput(code) {
  if (!inputEnabled) return;

  let forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(
    camera.quaternion
  );
  const worldUp = new THREE.Vector3(0, 1, 0);
  const upsideDown = cameraUp.dot(worldUp) < 0;

  console.log("handleMoveInput:", code, "upsideDown =", upsideDown);

  let move = null;

  if (code === "ArrowUp") {
    console.log("arrow up on mobile controls");
    if (Math.abs(forward.z) > Math.abs(forward.x)) {
      move = { axis: "z", dir: forward.z < 0 ? -1 : 1 };
    } else {
      move = { axis: "x", dir: forward.x < 0 ? -1 : 1 };
    }
  }

  if (code === "ArrowDown") {
    if (Math.abs(forward.z) > Math.abs(forward.x)) {
      move = { axis: "z", dir: forward.z < 0 ? 1 : -1 };
    } else {
      move = { axis: "x", dir: forward.x < 0 ? 1 : -1 };
    }
  }

  if (code === "ArrowRight") {
    if (Math.abs(right.z) > Math.abs(right.x)) {
      move = { axis: "z", dir: right.z < 0 ? -1 : 1 };
    } else {
      move = { axis: "x", dir: right.x < 0 ? -1 : 1 };
    }
  }

  if (code === "ArrowLeft") {
    if (Math.abs(right.z) > Math.abs(right.x)) {
      move = { axis: "z", dir: right.z < 0 ? 1 : -1 };
    } else {
      move = { axis: "x", dir: right.x < 0 ? 1 : -1 };
    }
  }

  if (code === "Space") {
    makeMove(selectedX, selectedZ);
    return;
  }

  if (move) {
    move.dir *= upsideDown ? -1 : 1;
    if (move.axis === "x") {
      selectedX = (selectedX + move.dir + cubeSize) % cubeSize;
    } else {
      selectedZ = (selectedZ + move.dir + cubeSize) % cubeSize;
    }
    updateSelector();
  }
}

function makeMove(x, z, player = currentPlayer) {
  // console.log("makeMove");
  // if ((gameOver || moveInProgress)&& currentPlayer == aiPlayer)
  // {
  //   console.log("here's the culprint, moveInprogress kicks you out");
  //   return;
  // }

  moveInProgress = true;

  if (addSphere(x, z, player)) {
    currentPlayer = 3 - currentPlayer;

    if (currentPlayer === aiPlayer) {
      inputEnabled = false;
      setTimeout(() => aiMove(aiPlayer), 500);
    } else {
      inputEnabled = true;
      moveInProgress = false;
    }
  } else {
    moveInProgress = false;
  }
}

function normalizeCameraDistance(radius = 10) {
  const center = new THREE.Vector3(0, 0, 0); // Use your board center if different
  const direction = new THREE.Vector3().subVectors(camera.position, center).normalize();
  const newPos = new THREE.Vector3().copy(direction).multiplyScalar(radius).add(center);

  new TWEEN.Tween(camera.position)
    .to({ x: newPos.x, y: newPos.y, z: newPos.z }, 600)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      controls.update();
    })
    .start();

  // Optionally snap controls target back to center
  new TWEEN.Tween(controls.target)
    .to(center, 600)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => controls.update())
    .start();
}

function removeCylinderBetweenPoints(p1, p2, tolerance = 0.01) {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

  scene.children.forEach((obj) => {
    if (obj.geometry instanceof THREE.CylinderGeometry) {
      const objLen = obj.geometry.parameters.height;
      const dist = obj.position.distanceTo(mid);
      if (Math.abs(objLen - len) < tolerance && dist < tolerance) {
        scene.remove(obj);
      }
    }
  });
}

function resetCameraAndZoom() {
  const defaultPosition = new THREE.Vector3(4, 6, 10); // or whatever your default is
  const defaultTarget = new THREE.Vector3(0, 0, 0); // center of the board

  // Animate camera position (for zooming and recentering)
  new TWEEN.Tween(camera.position)
    .to(
      { x: defaultPosition.x, y: defaultPosition.y, z: defaultPosition.z },
      600
    )
    .easing(TWEEN.Easing.Quadratic.Out)
    .start();

  // Animate controls target (where camera is looking)
  new TWEEN.Tween(controls.target)
    .to({ x: defaultTarget.x, y: defaultTarget.y, z: defaultTarget.z }, 600)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => controls.update()) // Important
    .start();
}

function resetGame() {
  gameOver = false;
  inputEnabled = false;
  disableKeyboardInput();

  // Remove all game-related meshes (spheres, columns, selector)
  const toRemove = [];
  scene.traverse((obj) => {
    if (
      obj.isMesh &&
      (obj.geometry.type === "SphereGeometry" ||
        obj.geometry.type === "CylinderGeometry")
    ) {
      toRemove.push(obj);
    }
  });

  toRemove.forEach((obj) => scene.remove(obj));

  // Reinitialize game state
  columnHeights = Array.from({ length: cubeSize }, () =>
    Array(cubeSize).fill(0)
  );
  gridState = Array.from({ length: cubeSize }, () =>
    Array.from({ length: cubeSize }, () => Array(cubeSize).fill(0))
  );
  columnMeshes = Array.from({ length: cubeSize }, () =>
    Array(cubeSize).fill(null)
  );

  // Recreate column meshes
  for (let x = 0; x < cubeSize; x++) {
    for (let z = 0; z < cubeSize; z++) {
      const initialHeight = Math.max(1, columnHeights[x][z]) * spacing;
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(
          columnRadius,
          columnRadius,
          initialHeight,
          16
        ),
        grayMat.clone()
      );
      col.position.set(
        (x - (cubeSize - 1) / 2) * spacing,
        initialHeight / 2 - (cubeSize / 2) * spacing,
        (z - (cubeSize - 1) / 2) * spacing
      );
      scene.add(col);
      columnMeshes[x][z] = col;
    }
  }

  // Reset selector
  selector.position.set(
    (selectedX - (cubeSize - 1) / 2) * spacing,
    0,
    (selectedZ - (cubeSize - 1) / 2) * spacing
  );
  scene.add(selector);

  // Reset UI
  selectedX = 0;
  selectedZ = 0;
  replayBtn.style.display = "none";

  const infoDiv = document.getElementById("cameraInfo");
  if (infoDiv) infoDiv.innerHTML = "";
  playAgain = playAgainScreen();
  if (!playAgain) showWelcomeScreen();
  enableKeyboardInput();
}







function showColorPicker() {
  inputEnabled = false;
  const overlay = document.createElement("div");
  overlay.id = "colorOverlay";
  overlay.style = `
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    z-index: 1000; color: white; font-size: 24px; font-family: sans-serif;
  `;
  overlay.innerHTML = "<p>Choose your color:</p>";

  const redBtn = document.createElement("button");
  redBtn.textContent = "🔴 Red (Play First)";
  redBtn.onclick = () => {
    // currentPlayer = 1;
    humanPlayer = 1;
    aiPlayer = 2;
    inputEnabled = true;
    document.body.removeChild(overlay);
  };

  const blueBtn = document.createElement("button");
  blueBtn.textContent = "🔵 Blue (Play Second)";
  blueBtn.onclick = () => {
    humanPlayer = 2;
    aiPlayer = 1;
    document.body.removeChild(overlay);
    setTimeout(() => {
      aiMove();
      inputEnabled = true;
    }, 500);
  };

  [redBtn, blueBtn].forEach((btn) => {
    btn.style = `margin: 10px; padding: 10px 20px; font-size: 20px;
      background: ${btn === redBtn ? "#ff3333" : "#3399ff"}; color: white;
      border: none; border-radius: 8px; cursor: pointer;`;
    overlay.appendChild(btn);
  });

  document.body.appendChild(overlay);
}

function showTwoPlayerMessage() {
  inputEnabled = false;
  const overlay = document.createElement("div");
  overlay.id = "colorOverlay";
  overlay.style = `
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    z-index: 1000; color: white; font-size: 24px; font-family: sans-serif;
  `;
  overlay.innerHTML = "<p>Red goes First, Blue goes Second </p>";

  const blueBtn = document.createElement("button");
  blueBtn.textContent = "🔴 Play now ";
  blueBtn.onclick = () => {
    // currentPlayer = 1;
    humanPlayer = 1;
    aiPlayer = 2;
    inputEnabled = true;
    document.body.removeChild(overlay);
  };

  blueBtn.style = `margin: 10px; padding: 10px 20px; font-size: 20px;
      background:  #3399ff; color: white;
      border: none; border-radius: 8px; cursor: pointer;`;
  overlay.appendChild(blueBtn);

  document.body.appendChild(overlay);
}

function showWelcomeScreen() {
  inputEnabled = false;
  const overlay = document.createElement("div");
  overlay.id = "welcomeOverlay";
  overlay.style = `
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    z-index: 1000; color: white; font-size: 24px; font-family: sans-serif;
  `;
  overlay.innerHTML =
    "<h1>Welcome to Connect 4 in 3D!</h1><p>Choose a game mode:</p>";

  const localBtn = document.createElement("button");
  localBtn.textContent = "👨‍👩‍👧 Two Players (Same Computer)";
  localBtn.onclick = () => {
    welcomeScreenOption = 1;
    twoPlayerGame = true;
    playOnline = false;
    document.body.removeChild(overlay);
    showTwoPlayerMessage();
  };

  const aiBtn = document.createElement("button");
  aiBtn.textContent = "🤖 Play Against Computer";
  aiBtn.onclick = () => {
    welcomeScreenOption = 2;
    twoPlayerGame = false;
    playOnline = false;
    document.body.removeChild(overlay);
    showColorPicker();
  };

  const onlineBtn = document.createElement("button");
  onlineBtn.textContent = "🌐 Play Online";
  onlineBtn.onclick = () => {
    welcomeScreenOption = 3;
    twoPlayerGame = true;
    playOnline = true;
    document.body.removeChild(overlay);
  };

  [localBtn, aiBtn, onlineBtn].forEach((btn) => {
    btn.style = `margin: 10px; padding: 10px 20px; font-size: 20px;
      background: #444; color: white;
      border: none; border-radius: 8px; cursor: pointer;`;
    overlay.appendChild(btn);
  });

  document.body.appendChild(overlay);
}

function showWinDialog(playerColor) {
  const overlay = document.createElement("div");
  overlay.id = "winOverlay";
  overlay.style = `
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    z-index: 1000; color: white; font-size: 24px; font-family: sans-serif;
  `;

  const message = document.createElement("p");
  message.innerText = `${playerColor} Player Wins!`;
  message.style = `margin-bottom: 20px; font-size: 32px; color: ${playerColor};`;

  const playAgainBtn = document.createElement("button");
  playAgainBtn.textContent = "🔄 Play Again";
  playAgainBtn.onclick = () => {
    document.body.removeChild(overlay);
    resetGame();
  };
  playAgainBtn.style = `
    padding: 12px 24px;
    font-size: 20px;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  `;

  overlay.appendChild(message);
  overlay.appendChild(playAgainBtn);
  document.body.appendChild(overlay);
}

function updateMobileControlsOrientation() {
  const container = document.getElementById("mobileControls");
  if (!container) return;

  const worldUp = new THREE.Vector3(0, 1, 0);
  const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(
    camera.quaternion
  );
  const upsideDown = cameraUp.dot(worldUp) < 0;

  container.style.transform = upsideDown ? "rotate(180deg)" : "rotate(0deg)";
}

function updateSelector() {
  selector.position.set(
    (selectedX - (cubeSize - 1) / 2) * spacing,
    0,
    (selectedZ - (cubeSize - 1) / 2) * spacing
  );
}

function updateSelector() {
  selector.position.set(
    (selectedX - (cubeSize - 1) / 2) * spacing,
    0,
    (selectedZ - (cubeSize - 1) / 2) * spacing
  );
}
// --- Global Declarations ---
let cameraInfo,
  buttonPanel,
  scene,
  camera,
  renderer,
  controls,
  sphereGeo,
  grayMat,
  colorOverlay,
  blueBtn,
  redBtn,
  columnHeight,
  columnHeights,
  gridState,
  columnMeshes,
  selMat,
  selector,
  replayBtn,
  diagonals;
let moveInProgress = false;
let welcomeScreenChoice = 0;
let twoPlayerGame = false;
let playOnline = false;
let humanPlayer = 1;
let currentPlayer = 1;
let gameOver = false;
let inputEnabled = false;
let selectedX = 0,
  selectedZ = 0;
let cubeSize = 4;
let spacing = 2;
let columnRadius = 0.6;
let aiPlayer = 2;

// --- Initialization Block ---
(() => {
  // Scene and Camera Setup
  scene = new THREE.Scene();
scene.background = new THREE.Color(0xbbbbcc); // Soft sky blue

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(4, 6, 10);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.style.margin = 0;
  document.body.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.target.set(0, 0, 0);
  controls.update();
  controls.addEventListener("end", () => {
    console.log("User released camera. Resetting view...");
    normalizeCameraDistance();
  });

  scene.add(new THREE.PointLight(0xffffff, 1).translateZ(20));
  scene.add(new THREE.AmbientLight(0x404040));

  // Game Constants
  cubeSize = 4;
  spacing = 2;
  columnRadius = 0.6;
  columnHeight = cubeSize * spacing;
  // gameState elements
  columnHeights = Array.from({ length: cubeSize }, () =>
    Array(cubeSize).fill(0)
  );
  gridState = Array.from({ length: cubeSize }, () =>
    Array.from({ length: cubeSize }, () => Array(cubeSize).fill(0))
  );
  columnMeshes = Array.from({ length: cubeSize }, () =>
    Array(cubeSize).fill(null)
  );

  // Materials and Geometry
  sphereGeo = new THREE.SphereGeometry(0.5, 16, 16);
  grayMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    transparent: true,
    opacity: 0.1
  });
  selMat = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.3
  });

  selector = new THREE.Mesh(
    new THREE.CylinderGeometry(
      columnRadius + 0.1,
      columnRadius + 0.1,
      columnHeight,
      16
    ),
    selMat
  );
  scene.add(selector);

  // Replay Button
  replayBtn = document.createElement("button");
  replayBtn.innerText = "🔄 Play Again";
  replayBtn.style = `
    position: absolute; top: 10px; right: 10px;
    padding: 10px 20px; font-size: 18px;
    border-radius: 8px; border: none;
    background: #4caf50; color: white;
    cursor: pointer; display: none;
  `;
  document.body.appendChild(replayBtn);
  replayBtn.onclick = resetGame;

  // Camera Info Box
  cameraInfo = document.createElement("div");
  cameraInfo.style.position = "absolute";
  cameraInfo.style.bottom = "10px";
  cameraInfo.style.left = "10px";
  cameraInfo.style.color = "white";
  cameraInfo.style.fontFamily = "monospace";
  cameraInfo.style.background = "rgba(0,0,0,0.4)";
  cameraInfo.style.padding = "6px 10px";
  cameraInfo.style.borderRadius = "4px";
  document.body.appendChild(cameraInfo);

  // Column Mesh Initialization
  for (let x = 0; x < cubeSize; x++) {
    for (let z = 0; z < cubeSize; z++) {
      const initialHeight = Math.max(1, columnHeights[x][z]) * spacing;
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(
          columnRadius,
          columnRadius,
          initialHeight,
          16
        ),
        grayMat.clone()
      );
      col.position.set(
        (x - (cubeSize - 1) / 2) * spacing,
        initialHeight / 2 - (cubeSize / 2) * spacing,
        (z - (cubeSize - 1) / 2) * spacing
      );
      scene.add(col);
      columnMeshes[x][z] = col;
    }
  }
  // inputEnabled = false;
  showWelcomeScreen();
  // showColorPicker();
  updateSelector();
  inputEnabled = true;
  enableKeyboardInput();
  document.body.appendChild(createDirectionButtons());

  // Initial Render and Start Loop
  renderer.render(scene, camera);
  animate();
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
