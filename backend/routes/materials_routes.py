from fastapi import APIRouter, Depends, Form, File, UploadFile
from sqlalchemy.orm import Session
from services.materials_services import MaterialsService
from utils.dependancies import get_current_user, get_db
from utils.connections import upload_file

router = APIRouter(prefix="/materials", tags=["Materials"])

#  CREATE MATERIAL (Instructor)
@router.post("/")
def create_material(
    class_id: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    material_type: str = Form(...),
    file: UploadFile = File(None),
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    materials_service = MaterialsService(db)
    
    file_url = None
    if file:
        file_url = upload_file(file, "materials")
    
    return materials_service.create_material(
        user,
        class_id=class_id,
        title=title,
        description=description,
        material_type=material_type,
        file_url=file_url
    )

#  GET CLASS MATERIALS
@router.get("/class/{class_id}")
def get_class_materials(class_id: str, db: Session = Depends(get_db)):
    materials_service = MaterialsService(db)
    return materials_service.get_class_materials(class_id)

#  DELETE MATERIAL
@router.delete("/{material_id}")
def delete_material(
    material_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    materials_service = MaterialsService(db)
    return materials_service.delete_material(user, material_id)

#  UPDATE MATERIAL (Instructor)
@router.put("/{material_id}")
def update_material(
    material_id: str,
    title: str = Form(None),
    description: str = Form(None),
    material_type: str = Form(None),
    file: UploadFile = File(None),
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    materials_service = MaterialsService(db)
    
    file_url = None
    if file:
        file_url = upload_file(file, "materials")
    
    return materials_service.update_material(
        user,
        material_id=material_id,
        title=title,
        description=description,
        material_type=material_type,
        file_url=file_url
    )
