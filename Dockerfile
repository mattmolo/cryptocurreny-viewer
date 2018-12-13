FROM python:2.7

COPY requirements.txt /

RUN pip install -r /requirements.txt

COPY . /app
WORKDIR /app

CMD ["gunicorn", "app:app", "-b", "0.0.0.0:4000"]
