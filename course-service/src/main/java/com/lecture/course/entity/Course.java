package com.lecture.course.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 // 주식 이름 - 종목 세부사항(ex. 하이닉스)
    @Column(nullable = false)
    private String title;
// 
    @Column(columnDefinition = "TEXT")
    private String description;
//주식 종목(ex. 반도체)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;
// 주식 가격
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    //삭제예정 
    // (users 테이블 참조 - 직접 JOIN 없이 ID만 보관)
    @Column(nullable = false)
    private Long instructorId;

    // 삭제 예정
    // 수강생 수 (추천 서비스 정렬 기준)
    @Column(nullable = false)
    @Builder.Default
    private Integer enrollmentCount = 0;

    // 고위험군 저위험군 구분 HIGH, LOW
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ACTIVE;
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Category {
        BACKEND, FRONTEND, DEVOPS, DATA_SCIENCE, MOBILE, SECURITY, DATABASE, OTHER
    }

    public enum Status {
        ACTIVE, INACTIVE
    }

    public void increaseEnrollmentCount() {
        this.enrollmentCount++;
    }
}
