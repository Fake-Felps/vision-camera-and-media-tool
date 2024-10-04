import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useMicrophonePermission, VideoFile } from 'react-native-vision-camera';
import { ResizeMode, Video } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';

export default function App() {

  //declaração das constantes
  const [permission, setPermission] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [ isRecording, setIsRecording ] = useState(false);
  const [videoUri, setVideoUri ] = useState<string | null>(null);
  const { hasPermission: hasMicPermission, requestPermission: requestMicPermission } = useMicrophonePermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);

  
  useEffect(() => {
    (async () => {
      const status = await requestPermission();
      const statusMic = await requestMicPermission();

      if (status && statusMic){
        setPermission(true); 
      }

      const { status: statusMediaLibrary } = await MediaLibrary.requestPermissionsAsync();
      if (statusMediaLibrary !== 'granted') return;
    })()
  }, []);

  // função para iniciar gravação
  const startRecording = () => {
    if(!cameraRef.current || !device) return;
    setIsRecording(true)

    cameraRef.current.startRecording({
      onRecordingFinished: async (video: VideoFile) => {
        setIsRecording(false);
        setVideoUri(video.path);
        console.log(video);
        await handleSaveVideo(video.path)
      },
      onRecordingError: (error: Error) => {
        console.log(error)
      }
    });

  }

  //função para encerrar gravação
  const stopRecording = async () => {
    if(cameraRef.current){
      await cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  }

  const handleSaveVideo = async (uri: string) => {
    if(videoUri){
      try{
        await MediaLibrary.createAssetAsync(videoUri);
      }catch(error){
        console.log(error)
      }
    }
  }

  return (
    <View style={styles.container}>
      {device && (
        <Camera
          style={StyleSheet.absoluteFill}
          ref={cameraRef}
          device={device}
          isActive={true}
          video={true}
          audio={true}
          resizeMode='cover'
        />
      )}
      <TouchableOpacity
        style={styles.botao}
        onPressIn={startRecording}
        onPressOut={stopRecording}
      />
      <Video
        source={{
          uri: videoUri || ''
        }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        shouldPlay
        isLooping
        resizeMode={ResizeMode.COVER}
        style={{ width: 300, height: 300}}
      
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  botao: {
    position: 'absolute',
    bottom: 40,
    width: 95,
    backgroundColor: '#fff',
    height: 95,
    borderRadius: 100,
    opacity: 0.9,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
