import { Options } from '@angular-slider/ngx-slider';
import { Component, ElementRef, OnInit } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const models: any = {
  "airplane": {
    "model": "airport",
    "name": "Aerial Airport Detection API",
    "url": "https://detect.roboflow.com/aerial-airport/1",
    "api_key": "NoIvcf8OmxkPs514UOI2",
    "imageGrid": [
      "assets/images/roboflow/airport/airport-1.jpg",
      "assets/images/roboflow/airport/airport-2.jpg",
      "assets/images/roboflow/airport/airport-3.jpg",
      "assets/images/roboflow/airport/airport-4.jpg"
    ],
  },
  "cherry": {
    "model": "cherry",
    "name": "Cherry Detection API",
    "url": "https://detect.roboflow.com/cerejas/3",
    "api_key": "aSutx0FVv5Y0tvrGGixn",
    "imageGrid": [
      "assets/images/roboflow/cherry/cherry-1.jpg",
      "assets/images/roboflow/cherry/cherry-3.jpg",
      "assets/images/roboflow/cherry/cherry-2.jpg",
      "assets/images/roboflow/cherry/cherry-4.jpg"
    ],
  },
  "thermal": {
    "model": "thermal",
    "name": "Thermal Dogs and People Detection API",
    "url": "https://detect.roboflow.com/thermal-dogs-and-people/3",
    "api_key": "NoIvcf8OmxkPs514UOI2",
    "imageGrid": [
      "assets/images/roboflow/cherry/cherry-1.jpg",
      "assets/images/roboflow/cherry/cherry-1.jpg",
      "assets/images/roboflow/cherry/cherry-3.jpg",
      "assets/images/roboflow/cherry/cherry-4.jpg"
    ],
  },
  "sheep": {
    "model": "sheep",
    "name": "Aerial Sheep Detection API",
    "url": "https://detect.roboflow.com/aerial-sheep/1",
    "api_key": "NoIvcf8OmxkPs514UOI2",
    "imageGrid": [
      "assets/images/roboflow/cherry/cherry-1.jpg",
      "assets/images/roboflow/cherry/cherry-1.jpg",
      "assets/images/roboflow/cherry/cherry-3.jpg",
      "assets/images/roboflow/cherry/cherry-4.jpg"
    ],
  },
}
@Component({
  selector: 'app-object-detection',
  templateUrl: './object-detection.component.html',
  styleUrls: ['./object-detection.component.scss']
})
export class ObjectDetectionComponent implements OnInit {

  isLoading: boolean;

  file: File = new File([""], "filename");
  fileCheck: boolean = false;
  predictionsJson: any;

  confidence: number = 50;
  overlap: number = 50;
  options: Options = {
    floor: 0,
    ceil: 100
  };

  imageUrl: any;
  imageLocal: any;
  modelType: any;
  inputUrl: string;

  url: string;
  api_key: string;
  title: string;
  jsonData: any;

  width = 550;
  height = 550;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient) {
    this.route.params.subscribe(params => this.modelType = params['type'])
    const axios = require('axios');
  }

  ngOnInit(): void {
    const prechosenImages = document.getElementById("prechosen_images");
    const prechosenImagesChildren: any = prechosenImages?.children;

    document.getElementById("prechosen_images")?.addEventListener("click", (event: MouseEvent) => {
      const canvas = document.getElementById("picture_canvas") as HTMLCanvasElement;
      const ctx:any = canvas.getContext("2d");

      (document.getElementById("picture") as HTMLElement).style.display = "block";
      (document.getElementById("picture_canvas") as HTMLElement).style.display = "none";
      let target: any = event.target as HTMLElement;
      while (target && target.tagName !== 'IMG') {
        target = target.parentElement;
      }
      if (target) {
        const imageElement = target as HTMLImageElement;
        let src = imageElement.src;
        src = src.replace("http://localhost:4200/", "");
        this.imageLocal = src;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.imageInference(src);
      }
    });

    let input: any = document.getElementById("inputUrl");
    input.addEventListener("keyup", (event: any) => {
      if (event.keyCode === 13) {
        event.preventDefault();
        this.imageLocal = this.inputUrl;
        //  this.imageInference(this.inputUrl);
      }
    });

    this.url = models[this.modelType]["url"];
    this.api_key = models[this.modelType]["api_key"];
    this.title = models[this.modelType]["name"];

    for (var i = 0; i < prechosenImagesChildren.length; i++) {
      prechosenImagesChildren[i].src = models[this.modelType]["imageGrid"][i];
    }

    this.imageLocal = "assets/images/roboflow/" + models[this.modelType]['model'] + '/' + models[this.modelType]['model'] + '-1.jpg';
    (document.getElementById("picture") as HTMLElement).style.display = "block";
    this.imageInference(this.imageLocal);
    // this.http.get('assets/jsons/airport.json').subscribe((success) => {
    //   this.jsonData = success;
    //   showJsoninList(this.jsonData);
    // });
  }

  onFileSelected(event: any) {
    if (event.target.files.length) {
      var fileTypes = ['jpg', 'jpeg', 'png'];  //acceptable file types
      var extension = event.target.files[0].name.split('.').pop().toLowerCase(),  //file extension from input file
        isSuccess = fileTypes.indexOf(extension) > -1;  //is extension in acceptable types
      if (isSuccess) { //yes
        // start file reader
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            this.imageLocal = event.target.result;
            (document.getElementById("picture") as HTMLElement).style.display = "block";
            (document.getElementById("picture_canvas") as HTMLElement).style.display = "none";
            this.imageInference(event.target.result);
          }
        };
        reader.readAsDataURL(event.target.files[0]);

      } else { //no
        alert('Selected file is not an image. Please select an image file.')
      }
    }
  }

  imageInference(image?: any) {
    const canvas = document.getElementById("picture_canvas") as HTMLCanvasElement;
    const ctx: any = canvas.getContext("2d");
    const img = new Image();

    img.src = image;
    this.isLoading = true;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    img.onload = () => {
      setImageState("picture_canvas");
      const [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, scalingRatio] = getCoordinates(img);
      const base64 = getBase64Image(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

      apiRequest(base64, this.url, this.api_key).then(predictions => {
        ({ predictions: predictions } = predictions)
        ctx?.beginPath();
        // draw image to canvas
        ctx?.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

        const selectElement = document.getElementById("selectMode") as HTMLSelectElement;
        selectElement.addEventListener("change", () => ctx?.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight));

        const rangeInput = document.getElementById("confidenceSlider") as HTMLInputElement;
        rangeInput.addEventListener("input", () => ctx?.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight));

        const mappedPredictions = predictions.map(function (prediction: any) {
          return {
            bbox: { x: prediction.x, y: prediction.y, width: prediction.width, height: prediction.height },
            class: prediction.class,
            confidence: prediction.confidence,
          };
        });

        this.isLoading = false;
        (document.getElementById("picture") as HTMLElement).style.display = "none";
        (document.getElementById("picture_canvas") as HTMLElement).style.display = "block";
        drawBoundingBoxes(mappedPredictions, canvas, ctx, scalingRatio, sx, sy, false);
      }
      );
    };
  }

  ImageInferenceWithUrl(width = 550, height = 550) {
    const canvas = document.getElementById("picture_canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.src = 'https://infograficos.estadao.com.br/uploads/galerias/8652/86044.jpg';

    ctx?.drawImage(img, 0, 0, width, height, 0, 0, width, height);
  }
}

function setImageState(canvasId = "picture_canvas", width = 550, height = 550): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  let img = new Image();

  img.onload = function () {
    ctx?.drawImage(img, 0, 0, width, height, 0, 0, width, height);
  };
}

function getCoordinates(img: any) {
  let dx = 0;
  let dy = 0;
  let dWidth = img.width;
  let dHeight = img.height;

  let sy;
  let sx;
  let sWidth = 0;
  let sHeight = 0;

  let imageWidth = img.width;
  let imageHeight = img.height;

  const canvasRatio = dWidth / dHeight;
  const imageRatio = imageWidth / imageHeight;

  // scenario 1 - image is more vertical than canvas
  if (canvasRatio >= imageRatio) {
    sx = 0;
    sWidth = imageWidth;
    sHeight = sWidth / canvasRatio;
    sy = (imageHeight - sHeight) / 2;
  } else {
    // scenario 2 - image is more horizontal than canvas
    sy = 0;
    sHeight = imageHeight;
    sWidth = sHeight * canvasRatio;
    sx = (imageWidth - sWidth) / 2;
  }

  let scalingRatio = dWidth / sWidth;

  if (scalingRatio === Infinity) {
    scalingRatio = 1;
  }

  return [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, scalingRatio];
}

function getBase64Image(
  img: any,
  sx: number,
  sy: number,
  sWidth: number,
  sHeight: number,
  dx: number,
  dy: number,
  dWidth: number,
  dHeight: number
): string {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx: any = canvas.getContext('2d');
  ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

  const dataURL = canvas.toDataURL('image/jpeg');
  return dataURL;
}

async function apiRequest(image: any, url: any, api_key: any): Promise<any> {
  const options = {
    method: "POST",

    url: url,
    params: {
      api_key: api_key
    },
    data: image,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };
  const response = await axios.request(options)
  showJsoninList(response.data);
  return response.data;
}

async function apiRequestByUrl(imageUrl: any, url: any, api_key: any): Promise<any> {
  const options = {
    method: "POST",
    url: url,
    params: {
      api_key: api_key,
      image: imageUrl
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };
  const response = await axios.request(options)
  return response.data;
}

function drawBoundingBoxes(
  predictions: any,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  scalingRatio: number,
  sx: number,
  sy: number,
  fromDetectAPI = false): void {

  const selectElement = document.getElementById("selectMode") as HTMLSelectElement;
  const rangeInput = document.getElementById("confidenceSlider") as HTMLInputElement;

  let selectedValue = selectElement.value;
  let confidenceValue = Number((rangeInput.value))/100;
  handleDraw();

  selectElement.addEventListener("change", () => {
    selectedValue = selectElement.value;
    handleDraw();
  });

  rangeInput.addEventListener("input", () => {
    confidenceValue = Number((rangeInput.value))/100;
    handleDraw();
  });

  function handleDraw() {
    for (let i = 0; i < predictions.length; i++) {
      let confidence = predictions[i].confidence;
      if (predictions[i].confidence > confidenceValue) {

        ctx.scale(1, 1);
        ctx.strokeStyle = '#bce61e';
        const prediction = predictions[i];

        var x1 = prediction.bbox.x - prediction.bbox.width / 2;
        var y1 = prediction.bbox.y - prediction.bbox.height / 2;
        var x2 = prediction.bbox.width;
        var y2 = prediction.bbox.height;

        if (!fromDetectAPI) {
          x1 -= sx;
          y1 -= sy;

          x1 *= scalingRatio;
          y1 *= scalingRatio;
          x2 *= scalingRatio;
          y2 *= scalingRatio;
        }
        if (x1 < 0) {
          x2 += x1;
          x1 = 0;
        }

        if (y1 < 0) {
          y2 += y1;
          y1 = 0;
        }

        ctx.rect(x1, y1, x2, y2);
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.fill();

        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 2;
        ctx.strokeRect(x1, y1, x2, y2);

        if (selectedValue === 'label') {
          var text = ctx.measureText(
            prediction.class + " " + Math.round(confidence * 100) + "%"
          );

          if (y1 < 20) {
            y1 = 30
          }

          ctx.fillStyle = ctx.strokeStyle;
          ctx.fillRect(x1 - 2, y1 - 30, text.width + 4, 30);
          ctx.font = "12px monospace";
          ctx.fillStyle = "black";

          ctx.fillText(
            prediction.class + " " + Math.round(confidence * 100) + "%",
            x1,
            y1 - 10
          );
        }
        else if (selectedValue === 'tax') {
          var text = ctx.measureText(
            Math.round(confidence * 100) + "%"
          );

          if (y1 < 20) {
            y1 = 30
          }

          ctx.fillStyle = ctx.strokeStyle;
          ctx.fillRect(x1 - 2, y1 - 30, text.width + 4, 30);

          ctx.font = "12px monospace";

          ctx.fillStyle = "black";
          ctx.fillText(
            Math.round(confidence * 100) + "%",
            x1,
            y1 - 10
          );
        }
      }
    }
  }
}

function showJsoninList(data: JSON) {
  (document.getElementById("jsonDisplay") as HTMLElement).style.display = "block";
  (document.getElementById("jsonDisplay") as HTMLElement).innerHTML = JSON.stringify(data, undefined, 2);
}
