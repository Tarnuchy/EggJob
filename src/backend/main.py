from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "jajo"}

@app.get("/test")
def health_check():
    return {"message": "test"}
