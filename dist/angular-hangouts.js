(function() {
    'use strict';

    angular.module('angularHangouts', []);
})();

(function (gapi) {
    'use strict';

    angular.module('angularHangouts')
        .service('HangoutsService', [hangoutsService]);

    function hangoutsService() {
        var service = {
            state: null,
            metadata: null,
            participants: [],
            onParticipantsChanged: null,
            onStateChanged: null,
            onParticipantsLeave: null,
            initialize: initialize,
            getValue: getValue,
            getHangoutId: getHangoutId,
            getMyId: getMyId,
            getMyKey: getMyKey,
            getUserKey: getUserKey,
            sendData: sendData,
            deleteData: deleteData,
            deleteValues: deleteValues
        };

        return service;

        function fetchState() {
            service.state = gapi.hangout.data.getState();
        }

        function fetchMetadata() {
            service.metadata = gapi.hangout.data.getStateMetadata();
        }

        function onStateChanged(stateChangeEvent) {
            fetchState();
            if(service.onStateChanged) {
                service.onStateChanged(stateChangeEvent);
            }
        }

        function onParticipantsChanged(participantsChangeEvent) {
            fetchState();
            service.participants = participantsChangeEvent.participants;
            if(service.onParticipantsChanged) {
                service.onParticipantsChanged(participantsChangeEvent);
            }
        }

        /*function onParticipantsLeave(stateChangeEvent) {
         fetchState();
         if(service.onParticipantsLeave) {
         service.onParticipantsLeave(stateChangeEvent);
         }
         }*/

        function makeUserKey(id, key) {
            return id + ':' + key;
        }

        function getState(opt_stateKey) {
            return (typeof opt_stateKey === 'string') ? service.state[opt_stateKey] : service.state;
        }

        function initialize() {
            if (gapi && gapi.hangout) {
                var initHangout = function(apiInitEvent) {
                    if (apiInitEvent.isApiReady) {
                        service.participants = gapi.hangout.getParticipants();
                        gapi.hangout.data.onStateChanged.add(onStateChanged);
                        gapi.hangout.onParticipantsChanged.add(onParticipantsChanged);
                        //gapi.hangout.onParticipantsRemoved.add(onParticipantsLeave);
                        //TODO: when someone close hangouts window, it could or it should delete its information to make data context cleaner
                        fetchState();
                        fetchMetadata();

                        gapi.hangout.onApiReady.remove(initHangout);
                    }
                };
                gapi.hangout.onApiReady.add(initHangout);
            }
        }

        function getValue(field, userId) {
            var key = field;
            if(userId) {
                key = makeUserKey(userId, field);
            }
            return getState(key);
        }

        function getHangoutId() {
            return gapi.hangout.getHangoutId();
        }

        function getMyId() {
            return gapi.hangout.getParticipantId();
        }

        function getMyKey(key) {
            return makeUserKey(service.getMyId(), key);
        }

        function getUserKey(userId, key) {
            return makeUserKey(userId, key);
        }

        function sendData(delta) {
            gapi.hangout.data.submitDelta(delta);
        }

        function deleteData(keys) {
            gapi.hangout.data.submitDelta({}, keys);
        }

        function deleteValues(userId, field) {
            var key = makeUserKey(field, userId);
            return deleteData([key]);
        }
    }
})(gapi);
