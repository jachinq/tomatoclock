import '../style/Navigation.css'
import Theme from '../component/Theme';
import Icon from '../component-ui/Icon';
import EventBus from '../scripts/EventBus';
import mitt from '../scripts/mitt';
import BackgroundMusic from '../component/BackgrounMusic';
import { useState } from 'react';
import { useEffect } from 'react';

export default function Navigation({setting, route=()=>{}}) {
    const [isPlayBgMusic, setIsPlayBgMusic] = useState(false);

    useEffect(()=>{
        const changeMusicIcon = (play) => setIsPlayBgMusic(play);
        mitt.on(EventBus.CHANGE_BACKGROUND_MUSIC_ICON, changeMusicIcon);

        return () => {
            mitt.off(EventBus.CHANGE_BACKGROUND_MUSIC_ICON, changeMusicIcon);
        }
    },[])

    return (<>
        <div className="glass navigation-wrap">
            <div className='navigation-item' onClick={() => mitt.emit(EventBus.CHANGE_THEME)}>
                <Theme setting={setting} />
            </div>
            {/* <div className='navigation-item' onClick={() => route('test')} >
                <Icon icon={'prompt'} hover={true} width={38} height={38} />
            </div> */}
            <div className='navigation-item' onClick={() => route('data')} >
                <Icon icon={'data'} hover={true} width={38} height={38} />
            </div>
            <div className='navigation-item'
                onClick={() => setIsPlayBgMusic((play => { mitt.emit(EventBus.CHANGE_BACKGROUND_MUSIC, !play); return !play; }))}>
                {isPlayBgMusic ? <Icon icon={'music-forbid'} hover={true} /> : <Icon icon={'music'} hover={true} />}
            </div>
            
            <div className='navigation-item' onClick={() => route('setting')}>
                <Icon icon={'setting'} hover={true} width={38} height={38} />
            </div>

            <div className='navigation-item' onClick={() => route('addTomato')}>
                <Icon icon={'tomato'} hover={true} />
            </div>
        </div>
        <BackgroundMusic />
    </>)
}