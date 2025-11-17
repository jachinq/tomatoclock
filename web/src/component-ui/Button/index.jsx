import Icon from '../Icon'
import './Button.css'

export default function Button(props) {

    return (<>
        <button className={'group button' + (props.type ? ' button-' + props.type : '')}
            disabled={props.disabled === undefined ? false : props.disabled}
            onClick={(e) => props.onClick && props.onClick(e)}>

            {props.icon !== undefined ? <div className="flex items-center">
                <Icon icon={props.icon} width={24} height={24}></Icon> {props.children}
            </div>
                : <>
                    {props.children}
                </>
            }
        </button>
    </>)
}