- kmk 디렉토리에 .env 파일 추가
- vqa_data라는 폴더 만들고
 https://visualqa.org/download.html 에서 
 1. VQA Annotations
 2. VQA Input Questions
 3. VQA Input Images
다운로드 받고

✦ kmk\
  └───vqa_data\
      ├───test2015\...
      ├───train2014\...
      ├───val2014\...
      ├───v2_mscoco_train2014_annotations.json
      ├───v2_mscoco_val2014_annotations.json
      ├───v2_OpenEnded_mscoco_test-dev2015_questions.json
      ├───v2_OpenEnded_mscoco_test2015_questions.json
      ├───v2_OpenEnded_mscoco_train2014_questions.json
      └───v2_OpenEnded_mscoco_val2014_questions.json

의 디렉토리 구조로 저장

kmk 디렉토리에서 

1. uvicorn vqa_app.main_cust:app --reload 

2. uvicorn vqa_app.main_vqa_tuning:app --reload  

실행 
