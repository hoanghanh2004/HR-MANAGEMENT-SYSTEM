import React from 'react';
import { PiMonitorArrowUpBold } from 'react-icons/pi';
// import './Totop.scss'
import imgtotop from '../../assets/arrow-up.png'
function ToTop() {
    return (
        <div className="to-top" style={{ position: 'fixed', bottom: "30px", right: "25px", borderRadius: "20px"}}>
            <a class="totop" href="#">
                <img src={imgtotop} alt=""  width={50} height={50}/>
            </a>
        </div>
    );
}
// https://th.bing.com/th/id/OIP.yjiJHt98tQVKOzuuHmKPDAHaIe?w=820&h=938&rs=1&pid=ImgDetMain
// https://smallimg.pngkey.com/png/small/28-288975_blue-up-arrow-blue-up-arrow-transparent.png
export default ToTop;
