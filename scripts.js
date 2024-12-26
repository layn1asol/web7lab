document.addEventListener("DOMContentLoaded", () => {
    const playButton = document.getElementById("play-button");
    const middle2 = document.querySelector(".middle2");
    let workElement, animElement, controlsElement, startButton, reloadButton;
    let eventCounter = 0;

    playButton.addEventListener("click", () => {
        playButton.disabled = true;
        // Clear data on the server
        fetch("server.php?clear_events=true", { method: "GET" })
            .then(response => response.json())
            .then(result => {
                if (result.status === "success") {
                    console.log("JSON data cleared successfully");
                } else {
                    console.error("Failed to clear JSON data:", result.message);
                }
            })
            .catch(error => console.error("Error:", error));

        // Clear local storage data
        localStorage.removeItem("eventLogs");

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
        const event = createEvent(action, description, "Server");

        // Send event to the server
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

    function logEventLocal(action, description) {
        const event = createEvent(action, description, "Local");

        // Retrieve and update local storage data
        const localLogs = JSON.parse(localStorage.getItem("eventLogs")) || [];
        localLogs.push(event);
        localStorage.setItem("eventLogs", JSON.stringify(localLogs));
    }

    function createEvent(action, description, source) {
        const now = new Date();
        now.setHours(now.getHours() + 2);
        return {
            id: ++eventCounter,
            action: action,
            description: description,
            timestamp: now.toISOString(),
            source: source,
        };
    }

    function startAnimation() {
        startButton.disabled = true;
        logEvent("Animation started", "Start of animation");
        logEventLocal("Animation started", "Start of animation");

        const circle = document.createElement("div");
        circle.classList.add("circle");
        animElement.appendChild(circle);

        let x = animElement.clientWidth / 2 - 10;
        let y = animElement.clientHeight / 2 - 10;
        let step = 1;
        let direction = "left";

        // Log the circle's position every second
        const positionLogger = setInterval(() => {
            const position = `Position: (${x}, ${y})`;
            logEvent("Object moved", position);
            logEventLocal("Object moved", position);
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
                clearInterval(positionLogger);

                logEvent("Animation ended", "End of animation");
                logEventLocal("Animation ended", "End of animation");

                // Send local storage events to the server
                const localLogs = JSON.parse(localStorage.getItem("eventLogs")) || [];
                Promise.all(
                    localLogs.map(event =>
                        fetch("server.php", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(event),
                        })
                    )
                )
                    .then(() => {
                        // Clear local storage after successful submission
                        localStorage.removeItem("eventLogs");
                        console.log("Local storage cleared after syncing events.");
                    })
                    .catch(error => console.error("Error syncing events:", error));

                startButton.remove();
                reloadButton = document.createElement("button");
                reloadButton.textContent = "Reload";
                controlsElement.appendChild(reloadButton);

                reloadButton.addEventListener("click", () => {
                    logEvent("Reload pressed", "User chose to reload the animation");
                    logEventLocal("Reload pressed", "User chose to reload the animation");
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
        logEventLocal("Animation closed", "User clicked Close button");

        // Clear local storage data
        localStorage.removeItem("eventLogs");
        console.log("Local storage cleared after pressing Close button.");

        if (workElement) {
            workElement.remove();
            middle2.classList.remove("work-active");
        }

        fetch("server.php?get_events=true")
            .then(response => response.json())
            .then(events => {
                // Sort events by ID in ascending order
                events.sort((a, b) => a.id - b.id);

                const table = document.createElement("table");
                table.style.borderCollapse = "collapse"; // Optional: For better appearance
                table.style.width = "100%"; // Optional: Adjust table width for layout

                table.innerHTML = `
                <tr>
                    <th style="padding: 10px;">ID</th>
                    <th style="padding: 10px;">Action</th>
                    <th style="padding: 10px;">Description</th>
                    <th style="padding: 10px;">Timestamp</th>
                    <th style="padding: 10px;">Source</th>
                </tr>`;

                events.forEach(event => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                    <td style="padding: 10px;">${event.id}</td>
                    <td style="padding: 10px;">${event.action}</td>
                    <td style="padding: 10px;">${event.description}</td>
                    <td style="padding: 10px;">${event.timestamp}</td>
                    <td style="padding: 10px;">${event.source}</td>`;
                    table.appendChild(row);
                });

                middle2.appendChild(table);
            })
            .catch(error => console.error("Error loading events:", error));
        playButton.disabled = false;
    }



});
