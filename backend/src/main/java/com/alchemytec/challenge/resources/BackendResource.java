package com.alchemytec.challenge.resources;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Optional;
import com.codahale.metrics.annotation.Timed;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.InputStream;
import java.util.List;

@Path("/labourstats")
@Produces(MediaType.APPLICATION_JSON)
public class BackendResource {

    public BackendResource() {
    }

    @GET
    @Timed
    public Response sampleStats() throws Exception {
        InputStream is = Thread.currentThread().getContextClassLoader().getResourceAsStream("sample.json");
        ObjectMapper mapper = new ObjectMapper();
        List<Object> objects = mapper.readValue(is, java.util.ArrayList.class);

        return Response.ok(objects).build();
        
    }
}