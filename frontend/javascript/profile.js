const modal = document.getElementById("imageModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const saveImageBtn = document.getElementById("saveImageBtn");
const fileInput = document.getElementById("fileInput");
const previewImage = document.getElementById("previewImage");
const profileImage = document.getElementById("profileImage");

/* Open modal */
openModalBtn.addEventListener("click", () => { modal.style.display = "flex"; });

/* Close modal */
closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
  previewImage.style.display = "none";
});

/* Preview selected image */
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    previewImage.src = URL.createObjectURL(file);
    previewImage.style.display = "block";
  }
});

/* Save new profile picture */
saveImageBtn.addEventListener("click", () => {
  if (previewImage.src) {
    profileImage.src = previewImage.src;
  }
  modal.style.display = "none";
});
