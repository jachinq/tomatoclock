import useState from "react-usestateref";

import Icon from "../component-ui/Icon";
import { useEffect } from "react";
import mitt from "../scripts/mitt";
import EventBus from "../scripts/EventBus";
import Util from "../scripts/Util";
import useAsync from "../hooks/useAsync";
import { set_config, set_theme } from "../scripts/Database";

export default function Theme({setting}) {

    const [_, setDark, darkRef] = useState(true);
    const {execute: setThemeDb} = useAsync(set_theme)

    function setTheme(dark) {
        let newDark = null;
        if (dark !== undefined && dark !== null) {
            newDark = dark;
        } else {
            newDark = !darkRef.current;
        }
        setDark(newDark);
        setThemeDb(newDark);

        const list = document.documentElement.classList;


        if (list) {
            if (!newDark) {
                // console.log('set light', newDark, list);
                list.remove('dark');
                Util.setRootCssValue('--svg-fill','#000');

            } else {
                // console.log('set dark', newDark, list);
                list.add('dark');
                Util.setRootCssValue('--svg-fill','#fff');

            }
        }
    }

    useEffect(() => {
        mitt.on(EventBus.CHANGE_THEME, setTheme);
        return () => {
            mitt.off(EventBus.CHANGE_THEME, setTheme);
        }
    }, [])

    return (<>
        {darkRef.current ? <Icon icon={'sun'} hover={true} />
            : <Icon icon={'moon'} hover={true} />
        }
    </>)
};