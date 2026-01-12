package com.productivityx.controller;

import com.productivityx.model.AlertEvent;
import com.productivityx.repository.AlertEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private AlertEventRepository alertRepository;

    @GetMapping
    public List<AlertEvent> listAlerts() {
        return alertRepository.findAll();
    }
}
