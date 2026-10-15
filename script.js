// =====================================
// DATA
// =====================================

let attendance =
    JSON.parse(localStorage.getItem("attendance")) || [];

let currentSession =
    JSON.parse(localStorage.getItem("session")) || null;


// =====================================
// TEACHER - CREATE SESSION
// =====================================

function createSession() {

    const subject =
        document.getElementById("subject").value.trim();

    const teacher =
        document.getElementById("teacherName").value.trim();


    if (subject === "" || teacher === "") {

        alert("Please enter subject and teacher name.");

        return;
    }


    const session = {

        subject: subject,

        teacher: teacher,

        date: new Date().toLocaleDateString(),

        sessionId:
            "SESSION-" + Date.now()

    };


    currentSession = session;


    localStorage.setItem(
        "session",
        JSON.stringify(session)
    );


    // Clear previous QR

    document.getElementById("teacherQR").innerHTML = "";


    // Generate QR

    new QRCode(
        document.getElementById("teacherQR"),
        {
            text: JSON.stringify(session),

            width: 220,

            height: 220
        }
    );


    document.getElementById("sessionMessage").innerText =
        "Attendance session created successfully!";


    updateDashboard();
}


// =====================================
// STUDENT - GENERATE QR
// =====================================

function generateStudentQR() {

    const name =
        document.getElementById("studentName")
        .value.trim();

    const roll =
        document.getElementById("rollNumber")
        .value.trim();


    if (name === "" || roll === "") {

        alert(
            "Please enter student name and roll number."
        );

        return;
    }


    const studentData = {

        name: name,

        roll: roll

    };


    document.getElementById("studentQR").innerHTML = "";


    new QRCode(
        document.getElementById("studentQR"),
        {
            text: JSON.stringify(studentData),

            width: 200,

            height: 200
        }
    );
}


// =====================================
// SCAN TEACHER QR
// =====================================

function onScanSuccess(decodedText) {

    try {

        const session =
            JSON.parse(decodedText);


        if (
            !session.sessionId ||
            !session.subject
        ) {

            throw new Error(
                "Invalid teacher QR"
            );

        }


        markAttendance(session);

    }

    catch (error) {

        document.getElementById(
            "scanMessage"
        ).innerText =
            "Invalid Teacher QR Code.";

    }
}


// =====================================
// MARK ATTENDANCE
// =====================================

function markAttendance(session) {

    const name =
        document.getElementById("studentName")
        .value.trim();

    const roll =
        document.getElementById("rollNumber")
        .value.trim();


    if (name === "" || roll === "") {

        alert(
            "First enter your Name and Roll Number."
        );

        return;
    }


    const today =
        new Date().toLocaleDateString();


    // Duplicate check

    const alreadyPresent =
        attendance.some(
            student =>
                student.roll === roll &&
                student.date === today &&
                student.sessionId ===
                session.sessionId
        );


    if (alreadyPresent) {

        document.getElementById(
            "scanMessage"
        ).innerText =
            "Attendance already marked!";

        return;
    }


    const now = new Date();


    const record = {

        name: name,

        roll: roll,

        subject: session.subject,

        teacher: session.teacher,

        sessionId: session.sessionId,

        date: today,

        time:
            now.toLocaleTimeString(),

        status: "Present"

    };


    attendance.push(record);


    localStorage.setItem(
        "attendance",
        JSON.stringify(attendance)
    );


    // Display success

    document.getElementById(
        "scanMessage"
    ).innerText =
        "✓ Attendance marked successfully!";


    document.getElementById(
        "studentStatus"
    ).innerText =
        "Present";


    updateDashboard();

    displayAttendance();
}


// =====================================
// DISPLAY ATTENDANCE
// =====================================

function displayAttendance() {

    const table =
        document.getElementById(
            "attendanceTable"
        );


    table.innerHTML = "";


    attendance.forEach(
        (student, index) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>${index + 1}</td>

                <td>${student.name}</td>

                <td>${student.roll}</td>

                <td>${student.time}</td>

                <td>
                    <strong>
                        ${student.status}
                    </strong>
                </td>

            `;


            table.appendChild(row);

        }
    );
}


// =====================================
// DASHBOARD
// =====================================

function updateDashboard() {

    const total =
        attendance.length;


    const present =
        attendance.filter(
            student =>
                student.status === "Present"
        ).length;


    const absent =
        total - present;


    document.getElementById(
        "totalStudents"
    ).innerText = total;


    document.getElementById(
        "presentStudents"
    ).innerText = present;


    document.getElementById(
        "absentStudents"
    ).innerText = absent;
}


// =====================================
// CLEAR ATTENDANCE
// =====================================

function clearAttendance() {

    const confirmDelete =
        confirm(
            "Delete all attendance records?"
        );


    if (!confirmDelete) {

        return;
    }


    attendance = [];


    localStorage.removeItem(
        "attendance"
    );


    displayAttendance();

    updateDashboard();


    document.getElementById(
        "studentStatus"
    ).innerText =
        "Not Marked";
}


// =====================================
// QR SCANNER
// =====================================

const scanner =
    new Html5QrcodeScanner(
        "reader",
        {
            fps: 10,

            qrbox: {
                width: 250,
                height: 250
            }
        },

        false
    );


scanner.render(
    onScanSuccess,
    onScanError
);


function onScanError(error) {

    // Ignore continuous scanning errors

}


// =====================================
// LOAD DATA
// =====================================

displayAttendance();

updateDashboard();