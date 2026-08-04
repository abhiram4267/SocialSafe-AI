

# from fastapi import APIRouter
# from schemas.text_schema import TextRequest, TextResponse
# from controllers.text_controller import predict_text

# router = APIRouter(
#     tags=["Text Moderation"]  # shows clearly in Swagger
# )

# @router.get("/messages")
# def get_messages():
#     return [
#         {
#             "id": 1,
#             "type": "text",
#             "content": "Welcome to SocialSafe AI",
#             "isUser": False
#         }
#     ]


# @router.post("/messages")
# async def analyze(request: MessageRequest):
#     result = predict_text(request.text)
#     return {
#         "status": "success",
#         "prediction": result["prediction"],
#         "confidence": f"{result['confidence']}%"
#     }




from fastapi import APIRouter, HTTPException
# Import the correct names from your schema file
from schemas.text_schema import TextRequest 
from controllers.text_controller import predict_text

router = APIRouter(
    tags=["Text Moderation"]
)

@router.get("/messages")
def get_messages():
    return [
        {
            "id": 1,
            "type": "text",
            "content": "Welcome to SocialSafe AI",
            "isUser": False
        }
    ]

@router.post("/messages")
async def analyze(request: TextRequest): # Changed from MessageRequest to TextRequest
    if not request.text or request.text.strip() == "":
        raise HTTPException(status_code=400, detail="Text content is required")
        
    try:
        # Call the logic from text_controller
        result = predict_text(request.text)
        
        return {
            "status": "success",
            "prediction": result["prediction"],
            "confidence": f"{result['confidence']}%",
            "label_id": result.get("label_id") # helpful for frontend logic
        }
    except Exception as e:
        print(f"Error in Text Analysis: {e}")
        raise HTTPException(status_code=500, detail="Model prediction failed")