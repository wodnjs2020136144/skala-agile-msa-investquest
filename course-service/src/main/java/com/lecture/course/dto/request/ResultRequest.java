package com.lecture.course.dto.request;

public record ResultRequest(
    int courseId,
    int price,
    int quantity
) {
}
