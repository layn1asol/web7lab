document.addEventListener("DOMContentLoaded", () => {
    const playButton = document.getElementById("play-button");
    const middle2 = document.querySelector(".middle2");
    let workElement, animElement, controlsElement, startButton, reloadButton;
    let eventCounter = 0;

    playButton.addEventListener("click", () => {
        // Очищаємо дані з JSON файлу
        fetch("server.php?clear_events=true", {
            method: "GET",
        })
            .then(response => response.json())
            .then(result => {
                if (result.status === "success") {
                    console.log("JSON data cleared successfully");
                } else {
                    console.error("Failed to clear JSON data:", result.message);
                }
            })
            .catch(error => console.error("Error:", error));

        middle2.innerHTML = "";
        middle2.classList.add("work-active");

        workElement = document.createElement("div");
        workElement.classList.add("work");
        middle2.appendChild(workElement);

        animElement = document.createElement("div");
        animElement.classList.add("anim");
        workElement.appendChild(animElement);

        controlsElement = document.createElement("div");
        controlsElement.classList.add("controls");
        workElement.appendChild(controlsElement);

        startButton = document.createElement("button");
        startButton.textContent = "Start";
        controlsElement.appendChild(startButton);

        const closeButton = document.createElement("button");
        closeButton.textContent = "Close";
        controlsElement.appendChild(closeButton);

        startButton.addEventListener("click", startAnimation);
        closeButton.addEventListener("click", closeAnimation);
    });

    function logEvent(action, description) {
        const now = new Date();
        now.setHours(now.getHours() + 2); // Add 2 hours to the current time
        const timestamp = now.toISOString(); // Convert to ISO string with updated time

        const event = {
            id: ++eventCounter,
            action: action,
            description: description,
            timestamp: timestamp,
            source: "Server", // Added source property
        };

        fetch("server.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(event),
        })
            .then(response => response.json())
            .then(result => {
                if (result.status === "success") {
                    console.log("Event saved successfully");
                } else {
                    console.error("Failed to save event:", result.message);
                }
            })
            .catch(error => console.error("Error:", error));
    }

    function startAnimation() {
        startButton.disabled = true;
        logEvent("Animation started", "Start of animation");

        const circle = document.createElement("div");
        circle.classList.add("circle");
        animElement.appendChild(circle);

        let x = animElement.clientWidth / 2 - 10;
        let y = animElement.clientHeight / 2 - 10;
        let step = 1;
        let direction = "left";

        // Log the circle's position every second
        const positionLogger = setInterval(() => {
            logEvent("Object moved", `Position: (${x}, ${y})`);
        }, 1000);

        const interval = setInterval(() => {
            if (direction === "left") x -= step;
            else if (direction === "up") y -= step;
            else if (direction === "right") x += step;
            else if (direction === "down") y += step;

            circle.style.left = `${x}px`;
            circle.style.top = `${y}px`;

            if (x <= 0 && direction === "left") direction = "up";
            else if (y <= 0 && direction === "up") direction = "right";
            else if (x >= animElement.clientWidth - 20 && direction === "right") direction = "down";
            else if (y >= animElement.clientHeight - 20 && direction === "down") {
                clearInterval(interval);
                clearInterval(positionLogger); // Stop logging when animation ends
                logEvent("Animation ended", "End of animation");

                startButton.remove();
                reloadButton = document.createElement("button");
                reloadButton.textContent = "Reload";
                controlsElement.appendChild(reloadButton);

                reloadButton.addEventListener("click", () => {
                    logEvent("Reload pressed", "User chose to reload the animation");
                    animElement.innerHTML = "";
                    reloadButton.remove();
                    startButton.disabled = false;
                    controlsElement.appendChild(startButton);
                });
            }
        }, 1);
    }

    function closeAnimation() {
        logEvent("Animation closed", "User clicked Close button");

        // Remove animation
        if (workElement) {
            workElement.remove();
            middle2.classList.remove("work-active");
        }

        // Load and display the log file
        fetch("server.php?get_events=true")
            .then(response => response.json())
            .then(events => {
                const table = document.createElement("table");
                table.innerHTML = `<tr><th>ID</th><th>Action</th><th>Description</th><th>Timestamp</th><th>Source</th></tr>`;

                events.forEach(event => {
                    const row = document.createElement("tr");
                    row.innerHTML =
                        `<td>${event.id}</td>
                        <td>${event.action}</td>
                        <td>${event.description}</td>
                        <td>${event.timestamp}</td>
                        <td>${event.source}</td>`;
                    table.appendChild(row);
                });

                middle2.appendChild(table);
            })
            .catch(error => console.error("Error loading events:", error));
    }
});
