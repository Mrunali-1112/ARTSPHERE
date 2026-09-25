package com.artsphere.model.dto;

import java.util.List;

public class EventDetailResponse extends EventResponse {

    private List<String> whatYoullLearn;
    private String whoCanJoin;
    private List<String> thingsToBring;
    private List<String> guidelines;
    private String quote;

    public EventDetailResponse() {
    }

    public List<String> getWhatYoullLearn() {
        return whatYoullLearn;
    }

    public void setWhatYoullLearn(List<String> whatYoullLearn) {
        this.whatYoullLearn = whatYoullLearn;
    }

    public String getWhoCanJoin() {
        return whoCanJoin;
    }

    public void setWhoCanJoin(String whoCanJoin) {
        this.whoCanJoin = whoCanJoin;
    }

    public List<String> getThingsToBring() {
        return thingsToBring;
    }

    public void setThingsToBring(List<String> thingsToBring) {
        this.thingsToBring = thingsToBring;
    }

    public List<String> getGuidelines() {
        return guidelines;
    }

    public void setGuidelines(List<String> guidelines) {
        this.guidelines = guidelines;
    }

    public String getQuote() {
        return quote;
    }

    public void setQuote(String quote) {
        this.quote = quote;
    }
}
