FROM python:3.8-slim-buster

WORKDIR /app

COPY ./Llama-3.2-1B /app/Llama-3.2-1B

RUN apt-get update && apt-get install -y gcc g++ procps
RUN pip install transformers Flask torch

COPY ./model.py /app/model.py

EXPOSE 5000

CMD ["python", "model.py"]
