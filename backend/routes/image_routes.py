# from fastapi import APIRouter, UploadFile, File, HTTPException
# from controllers.image_controller import process_image

# router = APIRouter()

# @router.post("/test-image")
# async def test_image(file: UploadFile = File(...)):
#     try:
#         return await process_image(file)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))



from fastapi import APIRouter, UploadFile, File, HTTPException
from controllers.image_controller import process_image
import uuid
import os

router = APIRouter()

@router.post("/test-image")
async def test_image(file: UploadFile = File(...)):
    # 1. Generate unique filename and path
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join("static/uploads", filename)

    # 2. Save file to server disk
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # 3. Create a mock file-like object for your controller
    # This allows your controller to read from disk
    class FileWrapper:
        async def read(self):
            with open(file_path, "rb") as f: return f.read()
    
    # 4. Run your existing AI prediction
    prediction_result = await process_image(FileWrapper())

    # 5. Add the URL to the result so the frontend knows where the file is
    prediction_result["url"] = f"http://10.81.95.247:8000/static/uploads/{filename}"
    return prediction_result