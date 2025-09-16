import './App.scss'
import Webcam from 'react-webcam'
import Container from "react-bootstrap/Container"
import Button from 'react-bootstrap/Button'
import { useEffect, useRef, useState } from 'react'
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision"

import * as kalidokit from "kalidokit";

function App() {
  const webcam = useRef();
  const [detectFlag, setDetectFlag] = useState(false);
  const poseLandmarker = useRef();
  const drawingUtils = useRef();
  const canvasRef = useRef();
  const ctxRef = useRef();

  const [cameraOK, setCameraOK] = useState(false);
  const [settingOK, setSettingOK] = useState(false);

  useEffect(() => {
    const createPoseLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      poseLandmarker.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "models/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 2,
      });
      setSettingOK(true);
      console.log("ready to mediapipe");
    };
    createPoseLandmarker();
  }, []);

  function loop(){
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    let startTime = performance.now();
    poseLandmarker.current.detectForVideo(
      webcam.current.video,
      startTime,
      (result) => {
        console.log(result.landmarks);
        for (const landmark of result.landmarks) {
          drawingUtils.current.drawLandmarks(landmark, {
            radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1)
          });
          drawingUtils.current.drawConnectors(landmark,
            PoseLandmarker.POSE_CONNECTIONS
          );
        }
      }
    );
    requestAnimationFrame(loop);
  }

  useEffect(() => {
    if(detectFlag) {
      canvasRef.current.width = webcam.current.video.clientWidth;
      canvasRef.current.height = webcam.current.video.clientHeight;
      ctxRef.current = canvasRef.current.getContext("2d");
      drawingUtils.current = new DrawingUtils(ctxRef.current);
      loop();
    }
  }, [detectFlag]);

  

  return (
    <>
      <div>
      <div className="position-relative">
        <Container fluid>
          {/* // className='item' */}
          <Webcam
            style={{
              width: "100%",
              maxWidth: "800px",
              padding: "10px",
            }}
            audio={false}
            ref={webcam}
            videoConstraints={{
              facingMode: "user",
            }}
            onUserMedia={() => setCameraOK(true)}
          />
          <canvas className="position-absolute top-0 start-0" ref={canvasRef} />
        </Container>
      </div>
        <Container fluid>
          {/* // className='item' */}
          <div>
            <Button onClick={() => setDetectFlag(true)}
                    disabled={!cameraOK && !settingOK}
                    className="m-2"
            >姿勢検出</Button>
            <Button onClick={() => setDetectFlag(false)}
                    disabled={!detectFlag}
                    className="m-2"
            >検出停止</Button>
          </div>
        </Container>
      </div>
    </>
  )
}

export default App


// TODO styleを当ててmediapipeを表示させる

// TODO setDetectFlagを使って検出を停止