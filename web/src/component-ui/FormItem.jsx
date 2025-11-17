
export default function FormItem({ label = "", width=80, children}) { 
    // grid-template-columns: 80px 1fr;
    return <>
        <div className={`grid gap-2 mb-2`} style={{gridTemplateColumns: `${width}px 1fr`}}>
            <span htmlFor="">{label}</span>
            {children}
        </div>
    </>
}