const API_URL = 'http://localhost:5000/images'; // แทนที่ด้วย URL ของ Backend ที่ Deploy แล้ว

let editingId = null; // เก็บ ID ของรูปภาพที่กำลังแก้ไข
let deleteId = null; // เก็บ ID ของรูปภาพที่ต้องการลบ

// ดึงข้อมูลรูปภาพทั้งหมด
async function fetchImages() {
    try {
        const response = await fetch(API_URL);
        const images = await response.json();
        displayImages(images);
    } catch (error) {
        console.error('Failed to fetch images:', error);
    }
}

// แสดงรูปภาพในหน้าเว็บ
function displayImages(images) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    images.forEach(image => {
        const imageCard = document.createElement('div');
        imageCard.className = gallery.classList.contains('list-view') ? 'image-card list-view' : 'image-card grid-view';
        imageCard.innerHTML = `
            <img src="${image.image_url}" alt="${image.title}">
            <h3>${image.title}</h3>
            <p>${image.description}</p>
            <div class="actions">
                <button class="edit" onclick="editImage(${image.id}, '${image.title}', '${image.description}', '${image.image_url}')">Edit</button>
                <button class="delete" onclick="showDeleteModal(${image.id})">Delete</button>
            </div>
        `;
        gallery.appendChild(imageCard);
    });
}

// แสดง Modal สำหรับการยืนยันการลบ
function showDeleteModal(id) {
    deleteId = id;
    document.getElementById('deleteModal').style.display = 'block';
}

// ซ่อน Modal
function hideDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

// ยืนยันการลบ
document.getElementById('confirmDeleteButton').addEventListener('click', async () => {
    if (deleteId) {
        try {
            await fetch(`${API_URL}/${deleteId}`, {
                method: 'DELETE',
            });
            fetchImages();
        } catch (error) {
            console.error('Failed to delete image:', error);
        }
    }
    hideDeleteModal();
});

// ยกเลิกการลบ
document.getElementById('cancelDeleteButton').addEventListener('click', hideDeleteModal);

// เพิ่มหรือแก้ไขข้อมูล
document.getElementById('imageForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const imageUrl = document.getElementById('imageUrl').value;

    try {
        if (editingId) {
            // แก้ไขข้อมูล
            await fetch(`${API_URL}/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description, image_url: imageUrl }),
            });
        } else {
            // เพิ่มข้อมูลใหม่
            await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description, image_url: imageUrl }),
            });
        }
        document.getElementById('imageForm').reset();
        editingId = null;
        document.getElementById('imageForm').style.display = 'none';
        document.getElementById('addImageButton').style.display = 'block';
        fetchImages();
    } catch (error) {
        console.error('Failed to save image:', error);
    }
});

// เตรียมฟอร์มสำหรับแก้ไข
function editImage(id, title, description, imageUrl) {
    document.getElementById('title').value = title;
    document.getElementById('description').value = description;
    document.getElementById('imageUrl').value = imageUrl;
    editingId = id;
    document.getElementById('imageForm').style.display = 'block';
    document.getElementById('addImageButton').style.display = 'none';
    document.getElementById('imageForm').scrollIntoView({ behavior: 'smooth' });
}

// ค้นหารูปภาพ
document.getElementById('searchButton').addEventListener('click', async () => {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    try {
        const response = await fetch(API_URL);
        const images = await response.json();
        const filteredImages = images.filter(image => 
            image.title.toLowerCase().includes(searchTerm) || 
            image.description.toLowerCase().includes(searchTerm)
        );
        displayImages(filteredImages);
    } catch (error) {
        console.error('Failed to search images:', error);
    }
});

// ยกเลิกการแก้ไข
document.getElementById('cancelButton').addEventListener('click', () => {
    document.getElementById('imageForm').reset();
    editingId = null;
    document.getElementById('imageForm').style.display = 'none';
    document.getElementById('addImageButton').style.display = 'block';
});

// สลับการแสดงผลระหว่างกริดและลิส
document.getElementById('gridViewButton').addEventListener('click', () => {
    document.getElementById('gallery').classList.remove('list-view');
    document.getElementById('gallery').classList.add('grid-view');
    document.getElementById('gridViewButton').classList.add('active');
    document.getElementById('listViewButton').classList.remove('active');
    fetchImages();
});

document.getElementById('listViewButton').addEventListener('click', () => {
    document.getElementById('gallery').classList.remove('grid-view');
    document.getElementById('gallery').classList.add('list-view');
    document.getElementById('listViewButton').classList.add('active');
    document.getElementById('gridViewButton').classList.remove('active');
    fetchImages();
});

// แสดงฟอร์มเมื่อกดปุ่ม Add Image
document.getElementById('addImageButton').addEventListener('click', () => {
    document.getElementById('imageForm').style.display = 'block';
    document.getElementById('addImageButton').style.display = 'none';
});

// โหลดรูปภาพเมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', fetchImages);