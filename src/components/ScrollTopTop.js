import { useEffect, useState } from "react";

export default function ScrollToTop(props) {
    const handleScrollToTop = props.handleScrollToTop;

    return (
        <div style={{position: 'fixed', bottom: 15, right: 15, cursor: 'pointer', width: 50}} 
        onClick={handleScrollToTop}>
            <img width="100%" src='https://gotravel.vn/tour-du-lich-he-gia-re/assets/img/back-to-top.png' alt="Go to top" />
        </div>
    )
}