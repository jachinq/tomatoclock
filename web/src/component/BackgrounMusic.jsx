import { useEffect } from "react"
import mitt from "../scripts/mitt"
import EventBus from "../scripts/EventBus"
import { useRef } from "react"
import { useCallback } from "react"
import useAsync from "../hooks/useAsync"
import { get_bgMusic } from "../scripts/Database"

export default function BackgroundMusic() {
    const audioRef = useRef(null);
    const { execute:getBgMusic, data: bgMusic } = useAsync(get_bgMusic);

    useEffect(() => {
        mitt.on(EventBus.CHANGE_BACKGROUND_MUSIC, getBgMusic);
        return () => {
            mitt.off(EventBus.CHANGE_BACKGROUND_MUSIC, getBgMusic)
        }
    }, [])

    const pauseMusic = useCallback((reset) => {
        if (audioRef.current !== null) {
            audioRef.current.pause();
            if (reset) {
                audioRef.current = null;
            }
            mitt.emit(EventBus.CHANGE_BACKGROUND_MUSIC_ICON, false);
        }
    }, [])

    useEffect(()=>{
        if (!bgMusic) return

        let { music: play = false, musicUrl = "" } = bgMusic;
        playMusic(play, musicUrl);

    }, [bgMusic])

    const playMusic = (play, musicUrl) => {

        // console.log({ play, music, musicUrl });
        if (play === false) { // 如果当前已有音频则直接暂停
            pauseMusic(false);  
            return;
        }

        // 默认音乐地址
        const defaultMusicUrl = 'https://pics.tide.moreless.io/chrome/scene_meditation.mp3';
        if (audioRef.current !== null) { // 有音频的情况下，判断是否修改了音乐url而需要重新加载
            const currentSrc = audioRef.current.currentSrc;
            if (musicUrl === "") { // 如果没设置自定义url，且当前音频地址和默认url不一致，也需要重新加载
                if (currentSrc !== defaultMusicUrl) {
                    pauseMusic(true);
                    // console.log("音频URL置空使用默认")
                }
            } else if (currentSrc !== musicUrl) {
                pauseMusic(true);
                // console.log("音频url修改切换", { musicUrl })
            }
        }

        if (audioRef.current === null) {
            const hasValidMusicUrl = musicUrl && musicUrl !== "";
            let useMusicUrl = hasValidMusicUrl ? musicUrl : defaultMusicUrl;
            audioRef.current = new Audio(useMusicUrl);
            audioRef.current.loop = true;
        }

        if (play) {
            // console.log(audioRef.current.currentSrc)
            audioRef.current.play();
            mitt.emit(EventBus.CHANGE_BACKGROUND_MUSIC_ICON, true);
        } else {
            pauseMusic(false);
        }
    }

    return null;
}