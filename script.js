function startBuilder() {
    document.getElementById("builder").scrollIntoView({
        behavior: "smooth"
    });
}

function scrollToFeatures() {
    document.getElementById("features").scrollIntoView({
        behavior: "smooth"
    });
}

function updateText(inputId, outputId, defaultText) {
    const input = document.getElementById(inputId);
    const output = document.getElementById(outputId);

    input.addEventListener("input", function () {
        output.textContent = this.value || defaultText;
        saveData();
    });
}

updateText("name", "cvName", "YOUR NAME");
updateText("title", "cvTitle", "Professional Title");
updateText("email", "cvEmail", "email@example.com");
updateText("phone", "cvPhone", "+91 0000000000");
updateText("address", "cvAddress", "Your Location");
updateText("summary", "cvSummary", "Write your professional summary here.");
updateText("degree", "cvDegree", "Degree / Course");
updateText("college", "cvCollege", "College / University");
updateText("year", "cvYear", "Year");
updateText("percentage", "cvPercentage", "CGPA / Percentage");
updateText("projectName", "cvProjectName", "Project Name");
updateText("projectDescription", "cvProjectDescription", "Project description will appear here.");
updateText("company", "cvCompany", "Company Name");
updateText("jobRole", "cvJobRole", "Job Role");
updateText("experience", "cvExperience", "Work experience details.");

const skillsInput = document.getElementById("skills");

skillsInput.addEventListener("input", function () {
    const skillsContainer = document.getElementById("cvSkills");
    skillsContainer.innerHTML = "";

    const skills = this.value.split(",");

    skills.forEach(skill => {
        if (skill.trim() !== "") {
            const span = document.createElement("span");
            span.textContent = skill.trim();
            skillsContainer.appendChild(span);
        }
    });

    saveData();
});

const languagesInput = document.getElementById("languages");

languagesInput.addEventListener("input", function () {
    const languagesContainer = document.getElementById("cvLanguages");
    languagesContainer.innerHTML = "";

    const languages = this.value.split(",");

    languages.forEach(language => {
        if (language.trim() !== "") {
            const span = document.createElement("span");
            span.textContent = language.trim();
            languagesContainer.appendChild(span);
        }
    });

    saveData();
});

document.getElementById("profileImage").addEventListener("change", function () {

    const file = this.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {

            const imagePreview = document.getElementById("imagePreview");
            const cvImage = document.getElementById("cvImage");

            imagePreview.src = event.target.result;
            imagePreview.style.display = "block";

            cvImage.src = event.target.result;
            cvImage.style.display = "block";

            localStorage.setItem("profileImage", event.target.result);
        };

        reader.readAsDataURL(file);
    }
});

function saveData() {

    const inputs = document.querySelectorAll("input[type='text'], input[type='email'], textarea");

    inputs.forEach(input => {
        localStorage.setItem(input.id, input.value);
    });
}

function loadData() {

    const inputs = document.querySelectorAll("input[type='text'], input[type='email'], textarea");

    inputs.forEach(input => {

        const savedValue = localStorage.getItem(input.id);

        if (savedValue) {
            input.value = savedValue;
            input.dispatchEvent(new Event("input"));
        }
    });

    const savedImage = localStorage.getItem("profileImage");

    if (savedImage) {

        const imagePreview = document.getElementById("imagePreview");
        const cvImage = document.getElementById("cvImage");

        imagePreview.src = savedImage;
        imagePreview.style.display = "block";

        cvImage.src = savedImage;
        cvImage.style.display = "block";
    }
}

async function downloadCV() {
    const button = document.querySelector(".final-download-btn");
    const cv = document.getElementById("cvPreview");
    const name = document.getElementById("name").value.trim() || "My-CV";

    if (!cv) {
        alert("CV preview not found!");
        return;
    }

    button.innerHTML = "Generating PDF...";
    button.disabled = true;

    try {
        const canvas = await html2canvas(cv, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false
        });

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const pdfWidth = 210;
        const pdfHeight = 297;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const pageHeightInPixels =
            Math.floor(canvasWidth * pdfHeight / pdfWidth);

        let position = 0;
        let pageNumber = 0;

        while (position < canvasHeight) {

            const pageCanvas = document.createElement("canvas");

            pageCanvas.width = canvasWidth;
            pageCanvas.height = Math.min(
                pageHeightInPixels,
                canvasHeight - position
            );

            const context = pageCanvas.getContext("2d");

            context.fillStyle = "#ffffff";
            context.fillRect(
                0,
                0,
                pageCanvas.width,
                pageCanvas.height
            );

            context.drawImage(
                canvas,
                0,
                position,
                canvasWidth,
                pageCanvas.height,
                0,
                0,
                canvasWidth,
                pageCanvas.height
            );

            const pageImage = pageCanvas.toDataURL(
                "image/jpeg",
                1.0
            );

            if (pageNumber > 0) {
                pdf.addPage();
            }

            const pageImageHeight =
                (pageCanvas.height * pdfWidth) / canvasWidth;

            pdf.addImage(
                pageImage,
                "JPEG",
                0,
                0,
                pdfWidth,
                pageImageHeight
            );

            position += pageHeightInPixels;
            pageNumber++;
        }

        const fileName =
            name.replace(/\s+/g, "-") + "-CV.pdf";

        pdf.save(fileName);

    } catch (error) {
        console.error(error);
        alert("Error generating PDF. Please try again.");
    } finally {
        button.innerHTML = "⬇ Download My CV";
        button.disabled = false;
    }
}