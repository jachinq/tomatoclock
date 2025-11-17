import { useState, useEffect, useRef, useCallback } from 'react'
import './style/App.css'

import Navigation from './layout/Navigation'
import mitt from './scripts/mitt'
import EventBus from './scripts/EventBus'
import Data from './layout/data/Data'

import Tomatos from './component/Tomatos'
import AddTomato from './component/AddTomato'
import Setting from './layout/Setting'
import Yiyan from './component/Yiyan'
import Home from './layout/Home'
import useSingleton from './hooks/useSingleton'
import Footer from './layout/Footer'
import useAsync from './hooks/useAsync'
import { get_setting } from './scripts/Database'

export default function App() {
  const tomatoRef = useRef();
  const [showHome, setShowHome] = useState(false);
  const [showData, setShowData] = useState(false);
  const [showAddTomato, setShowAddTomato] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  const { execute: getSetting, data: setting} = useAsync(get_setting);
  const refreshUI = useSingleton((args) => mitt.emit(EventBus.REFRESH_UI, args));
  const firstInitSetting = useSingleton(getSetting);

  useEffect(() => {
    firstInitSetting();
    const onShowAddTomato = () => openSomthing({ callback: setShowAddTomato });

    mitt.on(EventBus.SHOW_ADD_TOMATO, onShowAddTomato);
    mitt.on(EventBus.REFRESH_SETTING, getSetting);

    return () => {
      mitt.off(EventBus.SHOW_ADD_TOMATO, onShowAddTomato);
      mitt.off(EventBus.REFRESH_SETTING, getSetting);
    }
  }, [])

  useEffect(()=>{
    if (!setting) return
    refreshUI(setting);
  }, [setting])


  const route = (data) => {
    // console.log('route', data);
    const result = {};
    switch (data) {
      case 'data': result.callback = setShowData; break;
      case 'addTomato': result.callback = setShowAddTomato; break;
      case 'setting': result.callback = setShowSetting; break;
      case 'test': result.callback = setShowHome; break;
    }
    openSomthing(result);
  }

  const openSomthing = useCallback((data) => {
    if (!data || !data.callback) {
      return;
    }
    data?.callback(true);
    tomatoRef.current.classList.add('tomato-weaken');
  }, []);
  const closeSomthing = useCallback((handle) => {
    handle(false);
    tomatoRef.current.classList.remove('tomato-weaken');
  }, []);

  return (
    <div className='app relative flex'>
      <div id="bg-mask"></div>
      <Navigation route={(data) => route(data)} setting={setting} />

      <Tomatos ref={tomatoRef} />
      <Footer setting={setting}></Footer>
      <Yiyan setting={setting}/>

      {showHome && <Home close={() => closeSomthing(setShowHome)}></Home>}
      {showData && <Data close={() => closeSomthing(setShowData)}></Data>}
      {showAddTomato && <AddTomato setting={setting} close={() => closeSomthing(setShowAddTomato)} />}
      {showSetting && <Setting setting={setting} close={() => closeSomthing(setShowSetting)} />}

    </div>
  )
}