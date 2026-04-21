#!/bin/bash

FILE="/home/rabi/Devoria/frontend/app/dashboard/instructor/class/[id]/page.tsx"

# Backup the original file
cp "$FILE" "${FILE}.backup"

# 1. Add router import after "const { id: classId } = use(params);"
sed -i '/const { id: classId } = use(params);/a\  const router = useRouter();' "$FILE"

echo "✓ Step 1: Added router import"

# 2. Add new state declarations after "const [gradeForm, setGradeForm]" line
# First, find the exact line with gradeForm and add after the semicolon
sed -i '/const \[gradeForm, setGradeForm\]/a\
\
  // Cohort management\
  const [showCohortEditModal, setShowCohortEditModal] = useState(false);\
  const [showCohortDeleteModal, setShowCohortDeleteModal] = useState(false);\
  const [cohortForm, setCohortForm] = useState({ class_name: "", track: "" });\
\
  // Material edit\
  const [showMaterialEditModal, setShowMaterialEditModal] = useState(false);\
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);\
  const [materialEditForm, setMaterialEditForm] = useState({ title: "", description: "", material_type: "" });\
\
  // Assignment edit\
  const [showAssignmentEditModal, setShowAssignmentEditModal] = useState(false);\
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);\
  const [assignmentEditForm, setAssignmentEditForm] = useState({ title: "", description: "", deadline: "", is_final_project: false });' "$FILE"

echo "✓ Step 2: Added new state declarations"

# 3. Note: Sorting assignments in fetchClassData would need specific line context - skipping for now as it needs inspection

# 4. Add new handler functions after handleCreateMaterial
# We'll add these at the end of the handler functions section

sed -i '/const handleCreateMaterial = async/,/};/{
  /^  };$/a\
\
  const handleEditAssignment = async (e: React.FormEvent) => {\
    e.preventDefault();\
    if (!selectedAssignment) return;\
    setIsPosting(true);\
    try {\
      await api.put(`/assignments/${selectedAssignment.id}`, {\
        title: assignmentEditForm.title,\
        description: assignmentEditForm.description,\
        deadline: assignmentEditForm.deadline,\
        is_final_project: assignmentEditForm.is_final_project,\
      });\
      toast.success("Assignment updated!");\
      setShowAssignmentEditModal(false);\
      setSelectedAssignment(null);\
      fetchClassData();\
    } catch (err: any) { toast.error(err.response?.data?.detail || "Update failed"); }\
    finally { setIsPosting(false); }\
  };\
\
  const handleEditMaterial = (material: any) => {\
    setSelectedMaterial(material);\
    setMaterialEditForm({ title: material.title, description: material.description, material_type: material.material_type });\
    setShowMaterialEditModal(true);\
  };\
\
  const submitEditMaterial = async (e: React.FormEvent) => {\
    e.preventDefault();\
    if (!selectedMaterial) return;\
    try {\
      await api.put(`/materials/${selectedMaterial.id}`, { title: materialEditForm.title, description: materialEditForm.description, material_type: materialEditForm.material_type });\
      toast.success("Material updated!");\
      setShowMaterialEditModal(false);\
      setSelectedMaterial(null);\
      fetchClassData();\
    } catch (err: any) { toast.error(err.response?.data?.detail || "Update failed"); }\
  };\
\
  const handleEditCohort = () => { setCohortForm({ class_name: analytics?.class_name || "", track: analytics?.track || "" }); setShowCohortEditModal(true); };\
\
  const submitEditCohort = async (e: React.FormEvent) => {\
    e.preventDefault();\
    try {\
      await api.put(`/classes/${classId}`, { class_name: cohortForm.class_name, track: cohortForm.track });\
      toast.success("Cohort updated!");\
      setShowCohortEditModal(false);\
      fetchClassData();\
    } catch (err: any) { toast.error(err.response?.data?.detail || "Update failed"); }\
  };\
\
  const handleDeleteCohort = async () => {\
    if (!confirm("Delete this cohort? This cannot be undone.")) return;\
    try { await api.delete(`/classes/${classId}`); toast.success("Cohort deleted!"); router.push("/dashboard/instructor"); }\
    catch (err: any) { toast.error(err.response?.data?.detail || "Deletion failed"); }\
  };\
\
  const openEditAssignmentModal = (assignment: any) => { setSelectedAssignment(assignment); setAssignmentEditForm({ title: assignment.title, description: assignment.description, deadline: assignment.deadline, is_final_project: assignment.is_final_project }); setShowAssignmentEditModal(true); };
}' "$FILE"

echo "✓ Step 4: Added new handler functions"

echo "✓ All replacements completed!"
