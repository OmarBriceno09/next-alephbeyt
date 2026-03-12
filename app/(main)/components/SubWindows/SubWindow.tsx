type SubWindowProps = {
  id: string
  label: string
  expanded: boolean
  closing: boolean
  onClose: (id:string)=>void
  onExpand: (id:string)=>void
  children: React.ReactNode
}

export default function SubWindow({
  id,
  label,
  expanded,
  closing,
  onClose,
  onExpand,
  children
}:SubWindowProps){

  return (

    <div
        data-flip-id={id}
        className={`subWindow 
        ${expanded ? "fullRow" : ""} 
        ${closing ? "closing" : ""}`}
    >

      <div className="windowHeader">

        <span>{label}</span>

        <div>
          <button className="subWinBtn" onClick={()=>onExpand(id)}>⇔</button>
          <button className="subWinBtn" onClick={()=>onClose(id)}>✕</button>
        </div>

      </div>

      <div className="windowContent">
        {children}
      </div>

    </div>

  )
}