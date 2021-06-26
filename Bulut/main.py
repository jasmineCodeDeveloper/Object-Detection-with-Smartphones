import firebase_admin
from firebase_admin import storage
import cv2
import numpy as np
import random

app = firebase_admin.initialize_app(
    credential=None, options=None, name='[DEFAULT]')
bucket = storage.bucket(name="uygulama-firebase.appspot.com", app=app)

classes = ["insan", "bisiklet", "araba", "motorsiklet", "uçak", "otobüs", "tren", "kamyon", "tekne", "trafik ışıkları", "yangın musluğu", "dur işareti",  "parkmetre", "bank", "kuş", "kedi", "köpek", "at", "koyun", "inek", "fil", "ayı", "zebra", "zürafa", "sırt çantası", "şemsiye", "çanta", "kravat", "bavul/çanta", "frizbi", "kayak", "snowboard", "top", "uçurtma", "beyzbol sopası", "beyzbol eldiveni", "kaykay", "sörf tahtası", "raket",
           "şişe", "kadeh", "kupa", "çatal", "bıçak", "kaşık", "kase", "muz", "elma", "sandviç", "portakal", "brokoli", "havuç",  "sosisli", "pizza", "donut", "pasta", "sandalye", "kanepe",  "saksı bitkisi", "yatak",  "yemek masası", "tuvalet", "televizyon", "laptop", "fare", "kumanda", "klavye",  "cep telefonu", "mikrodalga", "fırın", "tost makinesi", "lavabo", "buzdolabı", "kitap", "saat", "vazo", "makas", "ayıcık", "saç kurutma makinesi", "diş fırçası"]

COLORS = np.random.uniform(0, 255, size=(len(classes), 3))
file = bucket.blob("yolov3.weights")
with open("/tmp/yolov3.weights", "wb") as file_obj:
    file.download_to_file(file_obj)
net = cv2.dnn.readNet("/tmp/yolov3.weights", "yolov3.cfg")


def get_output_layers(net):
    layer_names = net.getLayerNames()
    return [layer_names[i[0] - 1] for i in net.getUnconnectedOutLayers()]


turk_dict = {"ç": "c", "ı": "i", "ö": "o", "ü": "u", "ğ": "g", "ş": "s"}


def turk(label):
    for key in turk_dict:
        label = label.replace(key, turk_dict[key])
    return label


def draw_prediction(img, class_id, confidence, x, y, x_plus_w, y_plus_h, fontScale):
    label = turk(classes[class_id])
    color = COLORS[class_id]
    size, _ = cv2.getTextSize(label, fontFace=cv2.FONT_HERSHEY_SIMPLEX,fontScale=fontScale, thickness=2)
    cv2.rectangle(img, (x, y), (x_plus_w, y_plus_h), color, 2)
    cv2.putText(img, label, (x+5, round(y+size[1]+5)),cv2.FONT_HERSHEY_SIMPLEX, fontScale, color, 2)


def detect(request):
    request_json = request.get_json()
    if not request_json["name"].startswith("test/"):
        return "no"
    print(f"Processing file: {request_json['name']}.")
    file = bucket.blob(request_json['name'])
    jpg_as_np = np.frombuffer(file.download_as_bytes(), dtype=np.uint8)
    image = cv2.imdecode(jpg_as_np, flags=1)
    Width = image.shape[1]
    Height = image.shape[0]
    scale = 0.00392
    blob = cv2.dnn.blobFromImage(
        image, scale, (416, 416), (0, 0, 0), True, crop=False)

    net.setInput(blob)
    outs = net.forward(get_output_layers(net))

    class_ids = []
    confidences = []
    boxes = []
    conf_threshold = 0.5
    nms_threshold = 0.4

    for out in outs:
        for detection in out:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]
            if confidence > 0.5:
                center_x = int(detection[0] * Width)
                center_y = int(detection[1] * Height)
                w = int(detection[2] * Width)
                h = int(detection[3] * Height)
                x = center_x - w / 2
                y = center_y - h / 2
                class_ids.append(class_id)
                confidences.append(float(confidence))
                boxes.append([x, y, w, h])

    indices = cv2.dnn.NMSBoxes(
        boxes, confidences, conf_threshold, nms_threshold)

    results = []

    scale = 0.03
    fontScale = min(Width, Height)/(25/scale)

    for i in indices:
        i = i[0]
        box = boxes[i]
        x = box[0]
        y = box[1]
        w = box[2]
        h = box[3]
        results.append(
            {"class": classes[class_ids[i]], "confidence": confidences[i]})
        draw_prediction(image, class_ids[i], confidences[i], round(
            x), round(y), round(x+w), round(y+h), fontScale)

    filename = str(random.random())
    temp_location = '/tmp/' + filename + ".jpg"
    cv2.imwrite(temp_location, image)
    up = bucket.blob("done_"+request_json["name"])
    up.upload_from_filename(temp_location)
    return {"name": "done_"+request_json["name"], "info": results}
