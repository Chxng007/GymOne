package gymOne.gym.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gymOne.gym.dto.DashboardResponse;
import gymOne.gym.dto.TendenciaDiaResponse;
import gymOne.gym.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/resumen")
    public DashboardResponse resumen() {
        return dashboardService.resumen();
    }

    @GetMapping("/tendencia")
    public List<TendenciaDiaResponse> tendencia() {
        return dashboardService.tendencia();
    }
}
