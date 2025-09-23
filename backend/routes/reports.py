from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import requests
import tempfile
from .. import database
from .. import models
from .. import aws
from PIL import Image, ImageDraw, ImageFont
import os

router = APIRouter(
    prefix="/api/reports",
    tags=["reports"],
)

@router.post("/")
async def create_report(db: Session = Depends(database.get_db)):
    # This is a placeholder. In a real application, you would get the user from the request.
    user_id = 1

    # 1. Fetch user's carbon reduction data
    user_garden = db.query(models.UserGarden).filter(models.UserGarden.user_id == user_id).first()
    if not user_garden:
        raise HTTPException(status_code=404, detail="User garden not found")

    carbon_reduced = user_garden.total_carbon_reduced
    trees_saved = int(carbon_reduced / 10) # Assuming 10kg of CO2 saved = 1 tree

    # 2. Create report image
    template_path = os.path.join(os.path.dirname(__file__), "..", "report_template.png")
    if not os.path.exists(template_path):
        # Create a simple template if it doesn't exist
        img = Image.new('RGB', (600, 400), color = (255, 255, 240))
    else:
        img = Image.open(template_path)

    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("arial.ttf", 32)
    except IOError:
        font = ImageFont.load_default()

    draw.text((100, 100), f"이번 주 절약한 탄소: {carbon_reduced}kg", font=font, fill=(0,0,0))
    draw.text((100, 150), f"나무 {trees_saved}그루를 심은 효과! 🌳", font=font, fill=(0,0,0))

    # 3. Save the image to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
        img.save(temp_file.name)
        temp_image_path = temp_file.name

    # 4. Upload to S3
    file_name = f"reports/report_{user_id}_{int(datetime.now().timestamp())}.png"
    presigned_url_data = aws.get_presigned_url(file_name)
    if "error" in presigned_url_data:
        raise HTTPException(status_code=500, detail=presigned_url_data["error"])

    with open(temp_image_path, "rb") as f:
        response = requests.put(presigned_url_data['url'], data=f)

    os.remove(temp_image_path)

    image_url = f"https://seoul-ht-08.s3.us-west-1.amazonaws.com/{file_name}"

    # 5. Save report to database
    new_report = models.Report(user_id=user_id, report_type="weekly", image_url=image_url)
    db.add(new_report)
    db.commit()

    return {"url": image_url}
