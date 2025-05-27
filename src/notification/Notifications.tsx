import React, { Component } from 'react'

class Notifications extends Component {
    constructor(props: any) {
        super(props);
        this.state = {
            message: props.message,
        }
        this.showNotification = this.showNotification.bind(this);
    }

    componentDidMount(): void {
        if (!("Notification" in window)) {
            console.log("Browser does not support desktop notification");
        } else {
            if (Notification.permission === 'granted') {
                this.showNotification()
            } else {
                console.log('Notification permission not granted');
                Notification.requestPermission();
            }
        }
    } 

    showNotification() {
        console.log(this.state.message)
        var options = {
            body: this.state.message[0],
            icon: 'https://www.vkf-renzel.com/out/pictures/generated/product/1/356_356_75/r12044336-01/general-warning-sign-10836-1.jpg?    auto=compress&cs=tinysrgb&dpr=1&w=500',
            dir: 'ltr',
        };

        new Notification( this.state.message[1], options);

    }

    render() {
        return (
            <>
                <div>
                    </div>
            </>
        )
    }
}

export default Notifications