from models.materials import Material
from models.classes_models import Class
from fastapi import HTTPException
from datetime import datetime


class MaterialsService:
    def __init__(self, session):
        self.session = session

    def create_material(self, user, class_id, title, description, material_type, file_url=None):
        """Create a new course material"""
        
        # Check if class exists
        class_obj = self.session.query(Class).filter_by(id=class_id).first()
        if not class_obj:
            raise HTTPException(status_code=404, detail="Class not found")

        # Check if user is the instructor
        if class_obj.instructor_id != user.id:
            raise HTTPException(status_code=403, detail="Only the instructor can upload materials")

        # Create new material
        material = Material(
            class_id=class_id,
            title=title,
            description=description,
            material_type=material_type,
            file_url=file_url
        )

        self.session.add(material)
        self.session.commit()
        
        return {
            "id": material.id,
            "title": material.title,
            "description": material.description,
            "material_type": material.material_type,
            "file_url": material.file_url,
            "created_at": material.created_at.isoformat() if material.created_at else None
        }

    def get_class_materials(self, class_id):
        """Get all materials for a class"""
        materials = self.session.query(Material).filter_by(class_id=class_id).all()
        
        return [
            {
                "id": m.id,
                "title": m.title,
                "description": m.description,
                "material_type": m.material_type,
                "file_url": m.file_url,
                "created_at": m.created_at.isoformat() if m.created_at else None
            }
            for m in materials
        ]

    def delete_material(self, user, material_id):
        """Delete a course material"""
        
        material = self.session.query(Material).filter_by(id=material_id).first()
        if not material:
            raise HTTPException(status_code=404, detail="Material not found")

        # Check if user is the instructor of the class
        class_obj = self.session.query(Class).filter_by(id=material.class_id).first()
        if class_obj.instructor_id != user.id:
            raise HTTPException(status_code=403, detail="Only the instructor can delete materials")

        self.session.delete(material)
        self.session.commit()
        
        return {"message": "Material deleted successfully"}
