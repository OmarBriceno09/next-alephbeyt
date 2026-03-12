type SubWindowProps = {
  id: string
  label: string
  expanded: boolean
  closing: boolean | undefined
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
      className={`subWindow ${expanded ? "fullRow" : ""} ${closing ? "closing" : ""}`}
      data-flip-id={id}
    >

      <div className="windowHeader">

        <span>{label}</span>

        <div>
          <button className="subWinBtn expBtn" onClick={()=>onExpand(id)}>⇔</button>
          <button className="subWinBtn" onClick={()=>onClose(id)}>✕</button>
        </div>

      </div>

      <div className="windowContent">
        {children}
      </div>

    </div>

  )
}