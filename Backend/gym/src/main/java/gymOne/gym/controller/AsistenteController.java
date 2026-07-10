package gymOne.gym.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gymOne.gym.dto.AsistenteRequest;
import gymOne.gym.dto.AsistenteResponse;
import gymOne.gym.service.AsistenteService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/asistente")
public class AsistenteController {

    private final AsistenteService asistenteService;

    public AsistenteController(AsistenteService asistenteService) {
        this.asistenteService = asistenteService;
    }

    @PostMapping("/preguntar")
    public AsistenteResponse preguntar(@Valid @RequestBody AsistenteRequest request) {
        return asistenteService.preguntar(request.pregunta());
    }
}
