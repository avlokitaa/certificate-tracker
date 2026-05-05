document.addEventListener("DOMContentLoaded", () => {

  /* ===== LOGIN ===== */
  window.loginUser = function (e) {
    e.preventDefault();

    fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem("email", document.getElementById("username").value);
          localStorage.setItem("role", data.role);

          if (data.role === "proctor") {
            window.location.href = "dashboard.html";
          } else {
            window.location.href = "upload.html";
          }
        } else {
          alert("Invalid login credentials");
        }
      })
      .catch(() => alert("Server error during login"));
  };


  /* ===== STUDENT REGISTER ===== */
  window.registerStudent = function (e) {
    e.preventDefault();

    fetch("/api/auth/student/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: document.querySelectorAll("input")[0].value,
        email: document.querySelectorAll("input")[1].value,
        usn: document.querySelectorAll("input")[2].value,
        password: document.querySelectorAll("input")[3].value
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Student registered");
          window.location.href = "login.html";
        } else {
          alert(data.message || "Registration failed");
        }
      })
      .catch(() => alert("Server error during registration"));
  };


  /* ===== PROCTOR REGISTER ===== */
  window.registerProctor = function (e) {
    e.preventDefault();

    fetch("/api/auth/proctor/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: document.querySelectorAll("input")[0].value,
        email: document.querySelectorAll("input")[1].value,
        empId: document.querySelectorAll("input")[2].value,
        password: document.querySelectorAll("input")[3].value
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Proctor registered");
          window.location.href = "login.html";
        } else {
          alert(data.message || "Registration failed");
        }
      })
      .catch(() => alert("Server error during registration"));
  };


  /* ===== EVENT DETECTION ===== */
  const fileInput = document.getElementById("certificate");
  if (fileInput) {
    fileInput.addEventListener("change", () => {
      let type = "Other";
      let points = 5;

      if (!fileInput.files[0]) return;

      const name = fileInput.files[0].name.toLowerCase();

      if (name.includes("volunteer") || name.includes("ngo")) {
        type = "Volunteering"; points = 20;
      } else if (name.includes("hackathon")) {
        type = "Technical"; points = 15;
      } else if (name.includes("sports")) {
        type = "Sports"; points = 10;
      }

      document.getElementById("type").value = type;
      document.getElementById("points").value = points;
    });
  }


  /* ===== UPLOAD ===== */
  window.submitDetails = function (e) {
    e.preventDefault();

    const file = document.getElementById("certificate").files[0];
    if (!file) {
      alert("Please select a certificate file");
      return;
    }

    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("roll", document.getElementById("roll").value);
    formData.append("event", document.getElementById("event").value);
    formData.append("eventDate", document.getElementById("eventDate").value);
    formData.append("type", document.getElementById("type").value);
    formData.append("points", document.getElementById("points").value);
    formData.append("studentEmail", localStorage.getItem("email"));
    formData.append("certificate", file);

    fetch("/api/certificate/upload", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Certificate uploaded");
        } else {
          alert("Upload failed");
        }
      })
      .catch(() => alert("Server error during upload"));
  };


  /* ===== DASHBOARD ===== */
  if (window.location.pathname.includes("dashboard.html")) {
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    let url = "/api/certificate/all";
    if (role === "student") {
      url = `/api/certificate/my?email=${email}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const tbody = document.querySelector("tbody");
        tbody.innerHTML = "";

        if (role === "proctor") {
          document.querySelector(".progress-bar")?.remove();
          document.getElementById("progress-text")?.remove();
        }

        const studentMap = {};

        data.forEach(cert => {
          const roll = cert.roll;

          if (!studentMap[roll]) {
            studentMap[roll] = {
              name: cert.name,
              roll: cert.roll,
              totalPoints: 0,
              certificates: []
            };
          }

          studentMap[roll].totalPoints += Number(cert.points);
          studentMap[roll].certificates.push(cert);
        });


        if (role === "student") {
          let totalPoints = 0;

          data.forEach(cert => {
            totalPoints += Number(cert.points);

            tbody.innerHTML += `
              <tr>
                <td>${cert.name}</td>
                <td>${cert.roll}</td>
                <td>${cert.event}</td>
                <td>${new Date(cert.eventDate).toLocaleDateString()}</td>
                <td>${cert.type}</td>
                <td>${cert.points}</td>
                <td>
                  <a href="${cert.certificatePath}" target="_blank">
                    View PDF
                  </a>
                </td>
              </tr>
            `;
          });

          const progressFill = document.getElementById("progress-fill");
          const progressText = document.getElementById("progress-text");

          if (progressFill && progressText) {
            const percentage = Math.min(totalPoints, 100);
            progressFill.style.width = percentage + "%";
            progressText.textContent = `${totalPoints} / 100 Points`;
          }

        } else {

          Object.values(studentMap).forEach(student => {

            tbody.innerHTML += `
              <tr style="background:#f5f5f5;font-weight:bold;">
                <td>${student.name}</td>
                <td>${student.roll}</td>
                <td colspan="3">Total</td>
                <td>${student.totalPoints}</td>
                <td></td>
              </tr>
            `;

            student.certificates.forEach(cert => {
              tbody.innerHTML += `
                <tr style="font-size:0.9em;color:#555;">
                  <td></td>
                  <td></td>
                  <td>${cert.event}</td>
                  <td>${new Date(cert.eventDate).toLocaleDateString()}</td>
                  <td>${cert.type}</td>
                  <td>${cert.points}</td>
                  <td>
                    <a href="${cert.certificatePath}" target="_blank">
                      View PDF
                    </a>
                  </td>
                </tr>
              `;
            });

          });
        }
      })
      .catch(() => alert("Error loading dashboard"));
  }

});