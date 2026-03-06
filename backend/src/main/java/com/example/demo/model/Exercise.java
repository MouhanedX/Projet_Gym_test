package com.example.demo.model;

public class Exercise {
    private String name;
    private Integer sets;
    private Integer reps;
    private Double weight;
    private Integer durationSeconds;
    private String notes;

    public Exercise() {}

    public Exercise(String name, Integer sets, Integer reps, Double weight) {
        this.name = name;
        this.sets = sets;
        this.reps = reps;
        this.weight = weight;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getSets() { return sets; }
    public void setSets(Integer sets) { this.sets = sets; }

    public Integer getReps() { return reps; }
    public void setReps(Integer reps) { this.reps = reps; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
