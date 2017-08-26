from channels.routing import route
from channels.staticfiles import StaticFilesConsumer
from lastdays import consumers

channel_routing = [
    route("http.request", StaticFilesConsumer()),
    route("websocket.connect", consumers.ws_connect),
    route("websocket.disconnect", consumers.ws_disconnect),
    route("websocket.receive", consumers.ws_message),
]
